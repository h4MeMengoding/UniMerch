import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nama kategori harus diisi' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        NOT: {
          id: id
        }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: 'Kategori dengan nama tersebut sudah ada' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        createdAt: updatedCategory.createdAt.toISOString(),
        updatedAt: updatedCategory.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui kategori' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak dapat menghapus kategori yang masih memiliki produk' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}