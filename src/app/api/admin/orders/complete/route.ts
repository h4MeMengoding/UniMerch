import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID diperlukan' }, 
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
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

    // Check if order is paid
    if (order.status !== 'DIBAYAR') {
      return NextResponse.json(
        { success: false, message: 'Pesanan belum dibayar' }, 
        { status: 400 }
      );
    }

    // Update order status to completed
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'SUDAH_DIAMBIL' }
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diselesaikan',
      order: {
        id: order.id,
        user: order.user,
        items: order.items,
        totalAmount: order.totalAmount,
        status: 'SUDAH_DIAMBIL'
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