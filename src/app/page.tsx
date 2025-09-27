'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import HeroSection from '@/components/ui/HeroSection';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';

// Mock data untuk produk merchandise (Totebag, Bucket Hat, Kaos)
const mockProducts = [
  // Totebag
  {
    id: 'tb-a',
    name: 'Totebag Canvas – Desain A',
    description: 'Totebag canvas 12oz muat A4, sablon plastisol, tali kuat untuk aktivitas kampus.',
    price: 69000,
    originalPrice: 89000,
    image: '/api/placeholder/400/400',
    rating: 4.7,
    reviewCount: 128,
    category: 'Tas & Aksesoris',
    isNew: true,
    isOnSale: true,
  },
  {
    id: 'tb-b',
    name: 'Totebag Canvas – Desain B',
    description: 'Bahan canvas 12oz dengan saku dalam, cocok untuk buku A4 dan laptop tipis.',
    price: 79000,
    image: '/api/placeholder/400/400',
    rating: 4.5,
    reviewCount: 76,
    category: 'Tas & Aksesoris',
    isNew: false,
    isOnSale: false,
  },
  {
    id: 'tb-c',
    name: 'Totebag Premium – Desain C',
    description: 'Canvas premium 14oz, jahitan bartack di pegangan, kapasitas besar.',
    price: 99000,
    originalPrice: 119000,
    image: '/api/placeholder/400/400',
    rating: 4.6,
    reviewCount: 92,
    category: 'Tas & Aksesoris',
    isNew: false,
    isOnSale: true,
  },

  // Bucket Hat
  {
    id: 'bh-a',
    name: 'Bucket Hat – Desain A',
    description: 'Katun drill adem, bordir logo kampus di depan, rim medium.',
    price: 89000,
    originalPrice: 109000,
    image: '/api/placeholder/400/400',
    rating: 4.6,
    reviewCount: 54,
    category: 'Aksesoris',
    isNew: false,
    isOnSale: true,
  },
  {
    id: 'bh-b',
    name: 'Bucket Hat – Desain B (Hitam)',
    description: 'Bahan katun, bordir rapi, cocok untuk outdoor & casual.',
    price: 99000,
    image: '/api/placeholder/400/400',
    rating: 4.4,
    reviewCount: 38,
    category: 'Aksesoris',
    isNew: true,
    isOnSale: false,
  },
  {
    id: 'bh-c',
    name: 'Bucket Hat – Desain C (Navy)',
    description: 'Versi navy minimalis, ringan dan nyaman dipakai harian.',
    price: 109000,
    image: '/api/placeholder/400/400',
    rating: 4.5,
    reviewCount: 41,
    category: 'Aksesoris',
    isNew: true,
    isOnSale: false,
  },

  // Kaos
  {
    id: 'tee-a',
    name: 'Kaos – Desain A (Combed 24s)',
    description: 'Kaos unisex cotton combed 24s, sablon plastisol, cutting regular.',
    price: 119000,
    originalPrice: 149000,
    image: '/api/placeholder/400/400',
    rating: 4.8,
    reviewCount: 210,
    category: 'Pakaian',
    isNew: true,
    isOnSale: true,
  },
  {
    id: 'tee-b',
    name: 'Kaos – Desain B (Oversize 24s)',
    description: 'Bahan combed 24s, fit oversize, printing awet tidak mudah pecah.',
    price: 129000,
    image: '/api/placeholder/400/400',
    rating: 4.7,
    reviewCount: 143,
    category: 'Pakaian',
    isNew: false,
    isOnSale: false,
  },
  {
    id: 'tee-c',
    name: 'Kaos – Desain C (Combed 30s)',
    description: 'Lebih ringan dan adem, cocok untuk aktivitas harian.',
    price: 99000,
    originalPrice: 129000,
    image: '/api/placeholder/400/400',
    rating: 4.6,
    reviewCount: 98,
    category: 'Pakaian',
    isNew: false,
    isOnSale: true,
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
              Temukan koleksi merchandise pilihan terbaik disini.
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
