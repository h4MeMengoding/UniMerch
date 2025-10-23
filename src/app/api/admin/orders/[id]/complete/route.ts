import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const orderId = parseInt(idStr);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Order ID tidak valid' }, 
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' }, 
        { status: 404 }
      );
    }

    // Check if order can be completed
    if (order.status === 'BELUM_DIBAYAR') {
      return NextResponse.json(
        { success: false, message: 'Pesanan belum dibayar' }, 
        { status: 400 }
      );
    }

    if (order.status === 'SUDAH_DIAMBIL' || order.status === 'SELESAI') {
      return NextResponse.json(
        { success: false, message: 'Pesanan sudah selesai' }, 
        { status: 400 }
      );
    }

    if (order.status !== 'DIBAYAR' && order.status !== 'SIAP_DIAMBIL') {
      return NextResponse.json(
        { success: false, message: `Status pesanan tidak valid: ${order.status}` }, 
        { status: 400 }
      );
    }

    // Update order status to completed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'SUDAH_DIAMBIL',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            },
            variantOptions: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            xenditInvoiceId: true
          }
        }
      }
    });

    // Determine payment status properly
    let paymentStatus = 'PENDING';
    if (updatedOrder.payment) {
      switch (updatedOrder.payment.status) {
        case 'PAID':
          paymentStatus = 'PAID';
          break;
        case 'PENDING':
          paymentStatus = 'PENDING';
          break;
        case 'FAILED':
        case 'EXPIRED':
          paymentStatus = 'FAILED';
          break;
        default:
          paymentStatus = updatedOrder.payment.status;
      }
    } else if (updatedOrder.status === 'DIBAYAR' || updatedOrder.status === 'SIAP_DIAMBIL' || updatedOrder.status === 'SUDAH_DIAMBIL' || updatedOrder.status === 'SELESAI') {
      // If order status indicates payment completion but no payment record, assume paid
      paymentStatus = 'PAID';
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diselesaikan',
      order: {
        id: updatedOrder.id,
        orderCode: `#${String(updatedOrder.createdAt.getDate()).padStart(2, '0')}${String(updatedOrder.createdAt.getMonth() + 1).padStart(2, '0')}${String(updatedOrder.createdAt.getFullYear()).slice(-2)}${String(updatedOrder.id).padStart(5, '0')}`,
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: paymentStatus,
        user: updatedOrder.user,
        createdAt: updatedOrder.createdAt,
        items: updatedOrder.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          variantName: item.variantOptions.length > 0 
            ? item.variantOptions.map(opt => opt.name).join(', ')
            : null,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });

  } catch (error) {
    console.error('Error completing order:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}