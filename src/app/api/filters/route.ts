import { NextResponse } from 'next/server';
import { findCategories, findProducts } from '@/lib/database';

type SimpleProduct = {
  price?: number | null;
  category?: string | null;
  categoryId?: number | null;
};

type SimpleCategory = {
  id: number;
  name: string;
};

export async function GET() {
  try {
    // Load categories and all products (we need category and price fields)
    const categories = await findCategories();

    const products = await findProducts({
      select: { price: true, category: true, categoryId: true },
    });

  const maxPrice = products.length ? Math.max(...products.map((p: SimpleProduct) => p.price || 0)) : 0;

    // Count products per category. We consider both categoryId match and category name match for backward compatibility.
    const countsByCategoryId: Record<number, number> = {};
    const countsByCategoryName: Record<string, number> = {};

    for (const p of products) {
      if (p.categoryId) {
        countsByCategoryId[p.categoryId] = (countsByCategoryId[p.categoryId] || 0) + 1;
      }
      if (p.category) {
        const name = String(p.category).trim();
        if (name) countsByCategoryName[name.toLowerCase()] = (countsByCategoryName[name.toLowerCase()] || 0) + 1;
      }
    }

    const categoryList = categories.map((c: SimpleCategory) => {
      const byId = countsByCategoryId[c.id] || 0;
      const byName = countsByCategoryName[(c.name || '').toLowerCase()] || 0;
      const count = Math.max(byId, byName);
      return { id: c.id.toString(), label: c.name, count };
    });

    return NextResponse.json({ categories: categoryList, maxPrice });
  } catch (error) {
    console.error('Error building filters:', error);
    return NextResponse.json({ message: 'Error building filters' }, { status: 500 });
  }
}
