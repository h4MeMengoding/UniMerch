import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['DIBAYAR', 'SIAP_DIAMBIL', 'SUDAH_DIAMBIL', 'SELESAI'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
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

    return NextResponse.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan' },
      { status: 500 }
    );
  }
}