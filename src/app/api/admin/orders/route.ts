import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
    // Remove # if present
    const code = orderCode.replace('#', '');
    
    // Order code format: DDMMYYXXXXX (last 5 digits are order ID)
    if (code.length >= 5) {
      const idPart = code.slice(-5); // Last 5 characters
      const orderId = parseInt(idPart, 10);
      return isNaN(orderId) ? null : orderId;
    }
    
    // If it's just a number, try to parse it
    const directId = parseInt(orderCode, 10);
    return isNaN(directId) ? null : directId;
  } catch {
    return null;
  }
};

// GET - Get all orders for admin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');

    console.log('🔍 Search query:', searchQuery);

    // Build where clause
    const whereClause: Prisma.OrderWhereInput = {
      status: {
        not: 'BELUM_DIBAYAR' as Prisma.EnumOrderStatusFilter['not']
      }
    };

    // Add search filter if provided
    if (searchQuery) {
      // Try to extract order ID from the search query
      const orderId = extractOrderIdFromCode(searchQuery);
      console.log('🔍 Extracted order ID:', orderId);
      
      if (orderId !== null) {
        // Search by exact order ID
        whereClause.id = orderId;
      } else {
        // If not a valid order code, search by user info
        whereClause.OR = [
          { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
          { user: { email: { contains: searchQuery, mode: 'insensitive' } } }
        ];
      }
    }

    type OrderWithRelations = Prisma.OrderGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            phone: true;
          }
        };
        items: {
          include: {
            product: {
              select: {
                id: true;
                name: true;
                image: true;
              }
            };
            variantOptions: {
              select: {
                id: true;
                name: true;
              }
            }
          }
        };
        payment: {
          select: {
            id: true;
            status: true;
            xenditInvoiceId: true;
          }
        }
      }
    }>;

    const orders: OrderWithRelations[] = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📦 Found orders:', orders.length);

    // Transform orders to include paymentStatus field
    const transformedOrders = orders.map(order => {
      // Determine payment status properly
      let paymentStatus = 'PENDING';
      
      if (order.payment) {
        // Map Xendit payment status to our system
        switch (order.payment.status) {
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
            paymentStatus = order.payment.status;
        }
      } else if (order.status === 'DIBAYAR' || order.status === 'SIAP_DIAMBIL' || order.status === 'SUDAH_DIAMBIL' || order.status === 'SELESAI') {
        // If order status indicates payment completion but no payment record, assume paid
        paymentStatus = 'PAID';
      }

      return {
        id: order.id,
        orderCode: formatOrderCode(order.id, order.createdAt),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: paymentStatus,
        user: order.user,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        payment: order.payment,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product?.id || 0,
            name: item.product?.name || 'Produk dihapus',
            image: item.product?.image || ''
          }
        }))
      };
    });

    console.log('✅ Transformed orders:', transformedOrders.map(o => ({ id: o.id, orderCode: o.orderCode })));

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat pesanan' },
      { status: 500 }
    );
  }
}