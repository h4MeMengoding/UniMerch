import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to include product count
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat kategori' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Kategori dengan nama tersebut sudah ada' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dibuat',
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        productCount: 0,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}