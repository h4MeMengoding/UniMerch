import { NextResponse } from 'next/server';
import { findProductsWithVariants } from '@/lib/database';

type VariantOption = {
  id: number;
  name: string;
  image?: string | null;
};

type ProductVariant = {
  name: string;
  options?: VariantOption[];
};

type ProductWithVariants = {
  id: number;
  variants?: ProductVariant[];
};

export async function GET() {
  try {
    const products = await findProductsWithVariants();

    // Transform to lightweight structure
    const transformed = (products as ProductWithVariants[]).map((p) => ({
      id: p.id.toString(),
      variants: (p.variants || []).map((v) => ({
        name: v.name,
        options: (v.options || []).map((o: VariantOption) => ({ id: o.id.toString(), name: o.name, image: o.image }))
      }))
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching products with variants:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
