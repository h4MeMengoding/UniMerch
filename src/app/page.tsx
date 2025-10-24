'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Grid, List, SlidersHorizontal, Search } from 'lucide-react';
import HeroSection from '@/components/ui/HeroSection';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { Product } from '@/types/product';

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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query and category
    let filtered = products;
    
    // Filter by search query
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (categoryQuery && categoryQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.category && product.category.toLowerCase().includes(categoryQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryQuery]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Fallback to empty array if API fails
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to empty array if fetch fails
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortOptions = [
    { value: 'featured', label: 'Unggulan' },
    { value: 'price-low', label: 'Harga: Terendah ke Tertinggi' },
    { value: 'price-high', label: 'Harga: Tertinggi ke Terendah' },
    { value: 'rating', label: 'Rating Pelanggan' },
    { value: 'newest', label: 'Terbaru' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300 pt-16">
      {/* Hero Section - Hide when searching or filtering */}
      {!searchQuery && !categoryQuery && <HeroSection />}

      {/* Product Listing Section */}
      <section className={(searchQuery || categoryQuery) ? "py-12 pt-24" : "py-6 sm:py-8 md:py-12"}>
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {searchQuery ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary-600 mr-2" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
                    Hasil Pencarian
                  </h2>
                </div>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                  Menampilkan hasil untuk: <span className="font-semibold text-primary-600">"{searchQuery}"</span>
                </p>
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Tidak ditemukan produk yang sesuai dengan pencarian Anda
                  </p>
                )}
              </>
            ) : categoryQuery ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-3">🏷️</span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
                    Kategori {categoryQuery}
                  </h2>
                </div>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                  Produk dalam kategori: <span className="font-semibold text-primary-600">{categoryQuery}</span>
                </p>
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Tidak ditemukan produk dalam kategori ini
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                  Produk Unggulan
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                  Temukan koleksi merchandise pilihan terbaik disini.
                </p>
              </>
            )}
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
              {/* Filter Buttons & Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center flex-wrap gap-3">
                  {/* Results Count */}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {searchQuery || categoryQuery ? (
                      <>Menampilkan {filteredProducts.length} dari {products.length} produk</>
                    ) : (
                      <>Menampilkan {filteredProducts.length} produk</>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-dark-800 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors text-sm"
                    aria-label="Filter produk"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-neutral-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="Urutkan produk"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center space-x-1 p-1 bg-white dark:bg-dark-700 rounded-lg border border-neutral-300 dark:border-dark-600">
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
              </div>

              {/* Product Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700 overflow-hidden animate-pulse">
                      <div className="aspect-square bg-neutral-200 dark:bg-dark-700"></div>
                      <div className="p-3 sm:p-4">
                        <div className="h-4 bg-neutral-200 dark:bg-dark-700 rounded mb-2"></div>
                        <div className="h-3 bg-neutral-200 dark:bg-dark-700 rounded mb-3 w-3/4"></div>
                        <div className="h-5 bg-neutral-200 dark:bg-dark-700 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  // Empty state
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-neutral-200 dark:bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {searchQuery ? (
                        <Search className="w-6 h-6 text-neutral-400" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {searchQuery 
                        ? `Tidak ada produk yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                        : 'Produk akan muncul disini setelah admin menambahkannya'
                      }
                    </p>
                  </div>
                )}
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
