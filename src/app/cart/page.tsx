import { findProductsWithVariants } from '@/lib/database';
import type { Product } from '@/types/product';
import CartClient from '@/components/cart/CartClient';

export default async function CartPage() {
  const productsData = await findProductsWithVariants();
  const products: Product[] = (productsData || []).slice(0, 3).map((p) => ({
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    image: p.image || (p.variants?.[0]?.options?.[0]?.image ?? ''),
    category: p.category || '',
    isNew: p.isNew || false,
    isOnSale: p.isOnSale || false,
    stock: p.stock ?? 0,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  }));

  const initialItems = products.map((prod, idx) => ({
    id: prod.id,
    name: prod.name,
    description: prod.description,
    price: prod.price,
    image: prod.image,
    category: prod.category,
    quantity: idx === 0 ? 2 : 1,
  }));

  return <CartClient initialItems={initialItems} />;
}
