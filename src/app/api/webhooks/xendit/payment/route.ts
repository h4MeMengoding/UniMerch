import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook from Xendit (you should add signature verification in production)
    const webhookData = await request.json();
    
    console.log('Xendit webhook received:', webhookData);

    // Extract invoice ID and status from Xendit webhook
    const { id: invoiceId, status, external_id } = webhookData;

    if (!invoiceId || !status) {
      return NextResponse.json(
        { error: 'Invalid webhook data' }, 
        { status: 400 }
      );
    }

    // Find payment by Xendit invoice ID
    const payment = await prisma.payment.findUnique({
      where: { xenditInvoiceId: invoiceId },
      include: {
        order: true
      }
    });

    if (!payment) {
      console.log('Payment not found for invoice ID:', invoiceId);
      return NextResponse.json(
        { error: 'Payment not found' }, 
        { status: 404 }
      );
    }

    let newOrderStatus = payment.order.status;
    let newPaymentStatus = payment.status;

    // Map Xendit status to our system
    switch (status) {
      case 'PAID':
        newOrderStatus = 'DIBAYAR' as any;
        newPaymentStatus = PaymentStatus.PAID;
        break;
      case 'EXPIRED':
        newPaymentStatus = PaymentStatus.EXPIRED;
        break;
      case 'FAILED':
        newPaymentStatus = PaymentStatus.FAILED;
        break;
      default:
        // Unknown status, just log it
        console.log('Unknown Xendit status:', status);
        break;
    }

    // Update both order and payment status if there's a change
    if (newOrderStatus !== payment.order.status || newPaymentStatus !== payment.status) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: payment.order.id },
          data: { status: newOrderStatus }
        }),
        prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: newPaymentStatus,
            ...(status === 'PAID' ? { paidAt: new Date() } : {})
          }
        })
      ]);

      console.log(`Order ${payment.order.id} status updated from webhook: ${payment.order.status} -> ${newOrderStatus}`);
    }

    // Respond to Xendit webhook
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Error processing Xendit webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}