import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all users for admin (basic info only)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data pengguna' },
      { status: 500 }
    );
  }
}