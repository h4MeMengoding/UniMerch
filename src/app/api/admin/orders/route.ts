import { NextResponse } from 'next/server';
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
    const whereClause: any = {
      status: {
        not: 'BELUM_DIBAYAR'
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

    const orders = await prisma.order.findMany({
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
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderCode: formatOrderCode(order.id, order.createdAt),
      totalAmount: order.totalAmount,
      status: order.status.toLowerCase(),
      paymentStatus: order.payment?.status?.toLowerCase() || 'unknown',
      user: order.user,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        variantName: item.variantOptions.length > 0 
          ? item.variantOptions.map(opt => opt.name).join(', ')
          : null,
        quantity: item.quantity,
        price: item.price
      }))
    }));

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