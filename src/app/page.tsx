'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import HeroSection from '@/components/ui/HeroSection';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';

// Mock data untuk produk merchandise universitas
const mockProducts = [
  {
    id: '1',
    name: 'Jaket Hoodie UNNES Premium',
    price: 299000,
    originalPrice: 399000,
    image: '/api/placeholder/400/400',
    rating: 4.5,
    reviewCount: 128,
    category: 'Pakaian',
    isNew: true,
    isOnSale: true,
  },
  {
    id: '2',
    name: 'Kaos Polo Logo UNNES',
    price: 159000,
    image: '/api/placeholder/400/400',
    rating: 4.2,
    reviewCount: 89,
    category: 'Pakaian',
    isNew: false,
    isOnSale: false,
  },
  {
    id: '3',
    name: 'Tas Ransel UNNES Limited Edition',
    price: 449000,
    originalPrice: 549000,
    image: '/api/placeholder/400/400',
    rating: 4.8,
    reviewCount: 256,
    category: 'Tas & Aksesoris',
    isNew: true,
    isOnSale: true,
  },
  {
    id: '4',
    name: 'Topi Baseball UNNES',
    price: 89000,
    image: '/api/placeholder/400/400',
    rating: 4.3,
    reviewCount: 67,
    category: 'Aksesoris',
    isNew: false,
    isOnSale: false,
  },
  {
    id: '5',
    name: 'Mug Keramik Logo UNNES',
    price: 49000,
    originalPrice: 69000,
    image: '/api/placeholder/400/400',
    rating: 4.6,
    reviewCount: 143,
    category: 'Souvenir',
    isNew: false,
    isOnSale: true,
  },
  {
    id: '6',
    name: 'Kemeja Batik UNNES Eksklusif',
    price: 389000,
    image: '/api/placeholder/400/400',
    rating: 4.9,
    reviewCount: 89,
    category: 'Pakaian',
    isNew: true,
    isOnSale: false,
  },
  {
    id: '7',
    name: 'Totebag Canvas UNNES',
    price: 79000,
    originalPrice: 99000,
    image: '/api/placeholder/400/400',
    rating: 4.4,
    reviewCount: 95,
    category: 'Tas & Aksesoris',
    isNew: false,
    isOnSale: true,
  },
  {
    id: '8',
    name: 'Pin & Sticker Set UNNES',
    price: 25000,
    image: '/api/placeholder/400/400',
    rating: 4.7,
    reviewCount: 34,
    category: 'Souvenir',
    isNew: true,
    isOnSale: false,
  },
];

// Mock data untuk filter merchandise
const mockFilters = [
  {
    id: 'category',
    title: 'Kategori',
    type: 'checkbox' as const,
    options: [
      { id: 'pakaian', label: 'Pakaian', count: 45 },
      { id: 'tas-aksesoris', label: 'Tas & Aksesoris', count: 32 },
      { id: 'souvenir', label: 'Souvenir', count: 28 },
      { id: 'alat-tulis', label: 'Alat Tulis', count: 19 },
      { id: 'aksesoris', label: 'Aksesoris', count: 24 },
    ],
  },
  {
    id: 'price',
    title: 'Rentang Harga',
    type: 'range' as const,
    min: 0,
    max: 500000,
  },
  {
    id: 'rating',
    title: 'Rating Pelanggan',
    type: 'checkbox' as const,
    options: [
      { id: '5-stars', label: '5 Bintang', count: 12 },
      { id: '4-stars', label: '4 Bintang & Lebih', count: 28 },
      { id: '3-stars', label: '3 Bintang & Lebih', count: 45 },
    ],
  },
  {
    id: 'color',
    title: 'Warna',
    type: 'color' as const,
    colors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
  },
];

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  const sortOptions = [
    { value: 'featured', label: 'Unggulan' },
    { value: 'price-low', label: 'Harga: Terendah ke Tertinggi' },
    { value: 'price-high', label: 'Harga: Tertinggi ke Terendah' },
    { value: 'rating', label: 'Rating Pelanggan' },
    { value: 'newest', label: 'Terbaru' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection />

      {/* Product Listing Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Produk Unggulan
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Temukan koleksi merchandise UNNES pilihan terbaik yang dirancang khusus untuk mahasiswa dan alumni
            </p>
          </motion.div>

          <div className="flex">
            {/* Filter Sidebar */}
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={mockFilters}
            />

            {/* Main Content */}
            <div className="flex-1 lg:ml-6">
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-neutral-50 dark:bg-dark-800 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                    aria-label="Buka filter"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filter</span>
                  </button>

                  {/* Results Count */}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Menampilkan {mockProducts.length} produk
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-neutral-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="Urutkan produk"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center space-x-1 p-1 bg-white dark:bg-dark-700 rounded-md border border-neutral-300 dark:border-dark-600">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-600'
                      }`}
                      aria-label="Tampilan grid"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-600'
                      }`}
                      aria-label="Tampilan daftar"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Product Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {mockProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <motion.button
                  className="px-8 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Muat Lebih Banyak Produk
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
