import { NextResponse } from 'next/server';
import { findProducts } from '@/lib/database';

// GET - Fetch all products for public use
export async function GET() {
  try {
    const products = await findProducts({
      where: {
        stock: {
          gt: 0 // Only show products with stock > 0
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend interface
    const transformedProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      rating: 4.5, // Default rating for now
      reviewCount: Math.floor(Math.random() * 200) + 10, // Random review count for demo
      category: product.category,
      isNew: product.isNew,
      isOnSale: product.isOnSale
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    );
  }
}
