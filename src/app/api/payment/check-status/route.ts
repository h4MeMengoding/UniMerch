import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getInvoiceById } from '@/lib/xendit';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const { userId } = decoded;

    // Find orders with pending payments
    const orders = await prisma.order.findMany({
      where: { 
        userId: userId,
        OR: [
          { status: 'BELUM_DIBAYAR' },
          { 
            payment: {
              status: 'PENDING'
            }
          }
        ]
      },
      include: {
        payment: true,
      },
    });

    const updates = [];

    for (const order of orders) {
      if (order.payment?.xenditInvoiceId) {
        try {
          const xenditInvoice = await getInvoiceById(order.payment.xenditInvoiceId);
          
          let newOrderStatus = order.status;
          let newPaymentStatus = order.payment.status;

          // Update status based on Xendit response
          if (xenditInvoice.status === 'PAID') {
            newOrderStatus = 'DIBAYAR';
            newPaymentStatus = 'PAID';
          } else if (xenditInvoice.status === 'EXPIRED') {
            newPaymentStatus = 'EXPIRED';
            // Keep order status as is for expired payments
          }

          // Update database if status changed
          const orderUpdated = newOrderStatus !== order.status;
          const paymentUpdated = newPaymentStatus !== order.payment.status;

          if (orderUpdated || paymentUpdated) {
            // Update order status if needed
            if (orderUpdated) {
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: newOrderStatus,
                },
              });
            }

            // Update payment status if needed
            if (paymentUpdated) {
              await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: newPaymentStatus,
                  paidAt: newPaymentStatus === 'PAID' ? new Date() : null,
                },
              });
            }

            updates.push({
              orderId: order.id,
              oldOrderStatus: order.status,
              newOrderStatus: newOrderStatus,
              oldPaymentStatus: order.payment.status,
              newPaymentStatus: newPaymentStatus,
            });
          }
        } catch (xenditError) {
          console.error(`Error checking Xendit invoice ${order.payment.xenditInvoiceId}:`, xenditError);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Payment status check completed',
      updates: updates 
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}