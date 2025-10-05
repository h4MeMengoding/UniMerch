import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all orders for admin
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        // Only show orders that have been paid (not BELUM_DIBAYAR)
        status: {
          not: 'BELUM_DIBAYAR'
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat pesanan' },
      { status: 500 }
    );
  }
}