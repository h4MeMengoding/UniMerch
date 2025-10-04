import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getInvoiceById } from '@/lib/xendit';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
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

    const { orderId } = await request.json();

    // Find order and payment
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: userId 
      },
      include: {
        payment: true,
      },
    });

    if (!order || !order.payment) {
      return NextResponse.json(
        { error: 'Order or payment not found' },
        { status: 404 }
      );
    }

    // Check payment status from Xendit
    try {
      const xenditInvoice = await getInvoiceById(order.payment.xenditInvoiceId);
      
      let paymentStatus = 'PENDING';
      let orderStatus = 'BELUM_DIBAYAR';

      console.log('Xendit Invoice Status:', xenditInvoice.status);

      switch (String(xenditInvoice.status)) {
        case 'PAID':
        case 'SETTLED':
          paymentStatus = 'PAID';
          orderStatus = 'DIBAYAR';
          break;
        case 'EXPIRED':
          paymentStatus = 'EXPIRED';
          orderStatus = 'BELUM_DIBAYAR';
          break;
        default:
          // Handle any other status as pending
          paymentStatus = 'PENDING';
          orderStatus = 'BELUM_DIBAYAR';
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED',
          paidAt: (xenditInvoice.status === 'PAID' || xenditInvoice.status === 'SETTLED') ? new Date() : null,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus as 'BELUM_DIBAYAR' | 'DIBAYAR' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'SELESAI',
        },
      });

      return NextResponse.json({
        message: 'Payment status updated successfully',
        status: orderStatus,
        xenditStatus: xenditInvoice.status,
      });

    } catch (xenditError) {
      console.error('Error checking Xendit status:', xenditError);
      return NextResponse.json(
        { error: 'Failed to check payment status from Xendit' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}