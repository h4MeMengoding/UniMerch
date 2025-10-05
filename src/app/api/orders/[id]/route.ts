import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to format order code
const formatOrderCode = (orderId: number, createdAt: Date) => {
  const date = new Date(createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const id = String(orderId).padStart(5, '0');
  return `#${day}${month}${year}${id}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pesanan diperlukan' },
        { status: 400 }
      );
    }

    // Parse order ID
    const orderId = parseInt(id, 10);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'ID pesanan tidak valid' },
        { status: 400 }
      );
    }

    // Find order by ID with all related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
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
            amount: true,
            xenditInvoiceId: true,
            createdAt: true,
            paidAt: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan atau sudah tidak berlaku' },
        { status: 404 }
      );
    }

    // Add formatted orderCode to response
    const orderWithCode = {
      ...order,
      orderCode: formatOrderCode(order.id, order.createdAt)
    };

    return NextResponse.json({
      success: true,
      order: orderWithCode
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}