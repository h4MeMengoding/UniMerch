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

// Helper function to extract order ID from order code
const extractOrderIdFromCode = (orderCode: string): number | null => {
  try {
    // Remove # and validate format
    const code = orderCode.replace('#', '');
    
    // Expected format: DDMMYYXXXXX (11 characters)
    // DD (2) + MM (2) + YY (2) + XXXXX (5) = 11 total
    if (code.length !== 11) {
      return null;
    }
    
    // Extract the last 5 digits as order ID
    const idPart = code.slice(-5); // Last 5 characters
    const orderId = parseInt(idPart, 10);
    
    return isNaN(orderId) ? null : orderId;
    
  } catch (error) {
    return null;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Kode pesanan diperlukan' },
        { status: 400 }
      );
    }

    // Extract order ID from order code
    const orderId = extractOrderIdFromCode(code);
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Kode pesanan tidak ditemukan atau tidak valid' },
        { status: 404 }
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
            createdAt: true
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

    // Verify the order code matches
    const expectedOrderCode = formatOrderCode(order.id, order.createdAt);
    if (expectedOrderCode !== code) {
      return NextResponse.json(
        { success: false, message: 'Kode pesanan tidak valid untuk data pesanan ini' },
        { status: 400 }
      );
    }

    // Add formatted orderCode to response
    const orderWithCode = {
      ...order,
      orderCode: expectedOrderCode
    };

    return NextResponse.json({
      success: true,
      order: orderWithCode
    });

  } catch (error) {
    console.error('Error fetching order by code:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}