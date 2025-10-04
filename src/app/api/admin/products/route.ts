import { NextRequest, NextResponse } from 'next/server';
import { findProductsWithVariants, createProduct } from '@/lib/database';

// GET - Fetch all products
export async function GET() {
  try {
    const products = await findProductsWithVariants();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
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

    const product = await createProduct({
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
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Error creating product' },
      { status: 500 }
    );
  }
}
