import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Xendit webhook received:', body);
    
    const { status, id: invoiceId } = body;

    // Verify webhook (optional: add webhook token verification)
    
    // Find payment by Xendit invoice ID
    const payment = await prisma.payment.findUnique({
      where: { xenditInvoiceId: invoiceId },
      include: { order: true },
    });

    if (!payment) {
      console.log('Payment not found for invoice ID:', invoiceId);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    let paymentStatus = 'PENDING';
    let orderStatus = 'BELUM_DIBAYAR';

    console.log('Processing status:', status);

    switch (status.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
        paymentStatus = 'PAID';
        orderStatus = 'DIBAYAR';
        break;
      case 'EXPIRED':
        paymentStatus = 'EXPIRED';
        orderStatus = 'BELUM_DIBAYAR';
        // Restore product stock
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
        });
        
        for (const item of orderItems) {
          // Skip if product was deleted
          if (item.productId) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
        break;
      case 'FAILED':
        paymentStatus = 'FAILED';
        orderStatus = 'BELUM_DIBAYAR';
        break;
      default:
        console.log('Unhandled status:', status);
        paymentStatus = 'PENDING';
        orderStatus = 'BELUM_DIBAYAR';
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED',
        paidAt: (status.toUpperCase() === 'PAID' || status.toUpperCase() === 'SETTLED') ? new Date() : null,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: orderStatus as 'BELUM_DIBAYAR' | 'DIBAYAR' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'SELESAI',
      },
    });

    console.log('Successfully updated payment and order status:', {
      paymentId: payment.id,
      orderId: payment.orderId,
      newPaymentStatus: paymentStatus,
      newOrderStatus: orderStatus,
    });

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      paymentStatus,
      orderStatus,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}