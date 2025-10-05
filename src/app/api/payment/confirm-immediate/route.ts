import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Helper function to format order code
const formatOrderCode = (orderId: number, createdAt: Date) => {
  const date = new Date(createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const id = String(orderId).padStart(5, '0');
  return `#${day}${month}${year}${id}`;
};

// Helper function to extract order ID from code
const extractOrderIdFromCode = (orderCode: string): number | null => {
  try {
    const code = orderCode.replace('#', '');
    const idPart = code.slice(-5);
    const orderId = parseInt(idPart, 10);
    return isNaN(orderId) ? null : orderId;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { orderCode } = await request.json();

    if (!orderCode) {
      return NextResponse.json(
        { error: 'Order code is required' }, 
        { status: 400 }
      );
    }

    // Extract order ID from the order code
    const orderId = extractOrderIdFromCode(orderCode);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Invalid order code format' }, 
        { status: 400 }
      );
    }

    // Find the order by ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true
      }
    });

    if (!order || !order.payment) {
      return NextResponse.json(
        { error: 'Order or payment not found' }, 
        { status: 404 }
      );
    }

    // Verify the order code matches
    const expectedOrderCode = formatOrderCode(order.id, order.createdAt);
    if (expectedOrderCode !== orderCode) {
      return NextResponse.json(
        { error: 'Order code mismatch' }, 
        { status: 400 }
      );
    }

    // If already paid, return success
    if (order.status === 'DIBAYAR') {
      return NextResponse.json({
        success: true,
        message: 'Order already confirmed as paid',
        alreadyPaid: true
      });
    }

    // Immediately confirm payment since user reached success page from Xendit
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'DIBAYAR'
        }
      }),
      prisma.payment.update({
        where: { id: order.payment.id },
        data: { 
          status: PaymentStatus.PAID,
          paidAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed immediately',
      newStatus: 'DIBAYAR',
      confirmedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error confirming immediate payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}