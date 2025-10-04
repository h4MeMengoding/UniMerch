import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      isNew,
      isOnSale,
      stock,
      hasVariants,
      variants
    } = body;

    // Validate required fields
    if (!name || !price || !image || !category || stock === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, delete existing variants if any
    await prisma.productVariant.deleteMany({
      where: { productId }
    });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        image,
        category,
        isNew: Boolean(isNew),
        isOnSale: Boolean(isOnSale),
        stock: parseInt(stock),
        hasVariants: Boolean(hasVariants),
        variants: hasVariants && variants ? {
          create: variants.map((variant: { name: string; options: { name: string; image?: string }[] }) => ({
            name: variant.name,
            options: {
              create: variant.options.map((option: { name: string; image?: string }) => ({
                name: option.name,
                image: option.image || null
              }))
            }
          }))
        } : undefined
      },
      include: {
        variants: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error updating product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Error deleting product' },
      { status: 500 }
    );
  }
}