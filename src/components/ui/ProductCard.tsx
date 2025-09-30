'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Percent } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        className="group relative bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700 overflow-hidden hover:shadow-lg dark:hover:shadow-dark-900/50 transition-all duration-300 cursor-pointer min-h-[280px] sm:min-h-[320px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square sm:aspect-square overflow-hidden bg-neutral-100 dark:bg-dark-700">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized
          />

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col space-y-1 sm:space-y-2">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                NEW
              </span>
            )}
            {product.isOnSale && discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center transition-colors ${isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-dark-800/90 text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400'
              }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
          >
            <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Quick Actions - Only visible on hover */}
          <motion.div
            className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex space-x-1 sm:space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic here
              }}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Tambah</span>
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view logic here
              }}
              className="bg-white/90 dark:bg-dark-800/90 hover:bg-neutral-50 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300 p-1.5 sm:p-2 rounded-md border border-neutral-200 dark:border-dark-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Lihat cepat ${product.name}`}
            >
              <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Category */}
          <p className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white mb-2 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight" title={product.name}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2 sm:mb-3">
            <div className="flex space-x-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                />
              ))}
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            {product.originalPrice && product.originalPrice > product.price ? (
              // Harga diskon - dengan warna merah dan icon
              <div className="flex items-center space-x-1">
                <Percent className="w-3 h-3 text-red-500" />
                <span className="font-bold text-base sm:text-lg text-red-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              // Harga normal - tanpa icon
              <span className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-primary-600/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </Link>
  );
}
