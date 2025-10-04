export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  isNew: boolean;
  isOnSale: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields for UI display
  rating?: number;
  reviewCount?: number;
  discount?: number;
}
