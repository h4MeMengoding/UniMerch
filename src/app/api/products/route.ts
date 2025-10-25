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
      // Random rating between 3.5 and 5.0 with one decimal (e.g., 4.8, 4.9)
      rating: Math.round((Math.random() * 0.3 + 4.7) * 10) / 10,
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
