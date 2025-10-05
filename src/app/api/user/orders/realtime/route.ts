import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get all orders for the user with real-time data
    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.userId
      },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check for any recent payment updates by comparing timestamps
    const recentUpdates = orders.filter(order => {
      if (order.payment && order.payment.paidAt) {
        const paidTime = new Date(order.payment.paidAt).getTime();
        const now = new Date().getTime();
        // Consider updates within last 5 minutes as "recent"
        return (now - paidTime) < 5 * 60 * 1000;
      }
      return false;
    });

    return NextResponse.json({
      success: true,
      orders,
      hasRecentUpdates: recentUpdates.length > 0,
      recentUpdatesCount: recentUpdates.length
    });

  } catch (error) {
    console.error('Error in real-time orders check:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}