import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Helper function to format order code (same as in other APIs)
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
    
    // Extract the last 5 digits as order ID
    const idPart = code.slice(-5); // Last 5 characters
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

    // Skip if already paid
    if (order.status === 'DIBAYAR') {
      return NextResponse.json({
        success: true,
        status: order.status,
        message: 'Order already paid'
      });
    }

    // Check status with Xendit
    const xenditApiUrl = `https://api.xendit.co/v2/invoices/${order.payment.xenditInvoiceId}`;
    
    const xenditResponse = await fetch(xenditApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!xenditResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to check payment status with Xendit' },
        { status: 500 }
      );
    }

    const xenditData = await xenditResponse.json();
    
    // Map Xendit status to our status
    let newStatus: string = order.status;
    let paymentStatus = order.payment.status;
    
    if (xenditData.status === 'PAID') {
      newStatus = 'DIBAYAR';
      paymentStatus = PaymentStatus.PAID;
    } else if (xenditData.status === 'EXPIRED') {
      paymentStatus = PaymentStatus.EXPIRED;
    }

    // Update if status changed
    if (newStatus !== order.status || paymentStatus !== order.payment.status) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus as OrderStatus }
        }),
        prisma.payment.update({
          where: { id: order.payment.id },
          data: { status: paymentStatus }
        })
      ]);

      return NextResponse.json({
        success: true,
        statusChanged: true,
        newStatus,
        paymentStatus,
        message: 'Status updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      statusChanged: false,
      status: order.status,
      paymentStatus: order.payment.status,
      message: 'No status change'
    });

  } catch (error) {
    console.error('Error syncing payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}