'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, List, SlidersHorizontal, Search, ChevronRight } from 'lucide-react';
import HeroSection from '@/components/ui/HeroSection';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { Product } from '@/types/product';
import type { FilterSection } from '@/components/ui/FilterSidebar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState<string | null>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSection[]>([]);
  // color/variants removed — color filter no longer used
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // no-op: color/variant fetching removed
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch('/api/filters');
      if (!res.ok) return;
      const data = await res.json();

      const built: FilterSection[] = [];

      if (data.categories) {
        built.push({
          id: 'category',
          title: 'Kategori',
          type: 'checkbox',
          // use category label as option id so it matches product.category string
          options: data.categories.map((c: { label: string; count: number }) => ({ id: c.label, label: c.label, count: c.count }))
        });
      }

      built.push({
        id: 'price',
        title: 'Rentang Harga',
        type: 'range',
        min: 0,
        max: data.maxPrice ?? 0,
      });

      // color filter removed — server no longer returns colors

      setFilters(built);
    } catch (err) {
      console.error('Error fetching filters', err);
    }
  }, []);

  // Fetch products and filters on mount. fetchFilters is stable (useCallback), so it's safe to add to deps.
  useEffect(() => {
    fetchProducts();
    fetchFilters();
      // Read initial URL search params on client
      try {
        const params = new URLSearchParams(window.location.search);
        setSearchQuery(params.get('search'));
        setCategoryQuery(params.get('category'));
      } catch (e) {
        // ignore on server or if window is not available
      }
  }, [fetchFilters]);

  // Discounted products for promo scroller
  const discounted = products.filter(p => (p.originalPrice && p.originalPrice > p.price) || p.isOnSale);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollScroller = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.7, 160);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

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

  // color/variant handling removed — filter only supports category and price now

  const sortOptions = [
    { value: 'featured', label: 'Unggulan' },
    { value: 'price-low', label: 'Harga: Terendah ke Tertinggi' },
    { value: 'price-high', label: 'Harga: Tertinggi ke Terendah' },
    { value: 'rating', label: 'Rating Pelanggan' },
    { value: 'newest', label: 'Terbaru' },
  ];

  const gridColsClass = viewMode === 'grid'
    ? (isFilterOpen ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5')
    : 'grid-cols-1';

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300 pt-16">
      {/* Hero Section - Hide when searching or filtering. Show skeleton while loading */}
      {!searchQuery && !categoryQuery && (isLoading ? (
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative h-[160px] xs:h-[180px] sm:h-[220px] md:h-[250px] lg:h-[280px] overflow-hidden rounded-lg xs:rounded-xl sm:rounded-2xl bg-neutral-200 dark:bg-dark-700 animate-pulse" />
        </div>
      ) : (
        <HeroSection />
      ))}

      {/* Product Listing Section */}
      <section className={(searchQuery || categoryQuery) ? "py-12 pt-24" : "py-6 sm:py-8 md:py-12"}>
        <div className="container mx-auto px-4 max-w-7xl">
      {/* Section Header */}
          {/* Promo discounted products section (matches UI in attachment) */}
          {!isLoading && discounted && discounted.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-white dark:from-black/5 rounded-2xl p-4 sm:p-6 overflow-hidden relative shadow-sm">
                <div className="container mx-auto px-4 max-w-7xl">
                  <div className="flex items-center gap-4 relative">
                    {/* Left promo panel */}
                    <div className="hidden sm:flex flex-col justify-between bg-white/90 dark:bg-dark-800/60 rounded-lg p-4 w-64 shadow-md">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Member baru? Ini promomu!</h3>
                        <p className="text-3xl font-extrabold text-primary-600 mt-2">Cashback<br />99%</p>
                        <p className="text-xs text-neutral-500 mt-2">PELANGGANBARU-... </p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => { navigator.clipboard?.writeText('PELANGGANBARU-99'); }}
                          className="bg-white border border-neutral-200 text-primary-600 px-3 py-1 rounded-full text-sm shadow-sm"
                        >
                          Salin
                        </button>
                      </div>
                    </div>

                    {/* Horizontal product scroller */}
                    <div className="flex-1">
                      <div ref={scrollerRef} className="overflow-x-auto no-scrollbar scroll-smooth px-1">
                        <div className="flex items-start space-x-4 py-1">
                            {discounted.map((p) => (
                            <div key={p.id} className="w-40 min-w-[160px] sm:w-44 sm:min-w-[176px] bg-white dark:bg-dark-800 rounded-xl border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-0.5">
                              <div className="relative aspect-square bg-neutral-100 dark:bg-dark-700">
                                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                                {((p.originalPrice && p.originalPrice > p.price) || p.isOnSale) && (
                                  <span className="absolute -top-2 left-2 bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded">-{Math.round(((p.originalPrice ?? p.price) - p.price) / (p.originalPrice ?? p.price) * 100)}%</span>
                                )}
                              </div>
                              <div className="p-2">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.name}</div>
                                <div className="text-xs text-neutral-500 line-through">{p.originalPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.originalPrice) : ''}</div>
                                <div className="text-sm font-bold text-neutral-900 dark:text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Left chevron button to scroll */}
                    <button
                      onClick={() => scrollScroller(-1)}
                      aria-label="Scroll promo left"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white text-primary-600 p-2 rounded-full shadow-md hidden md:flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>

                    {/* Right chevron button to scroll */}
                    <button
                      onClick={() => scrollScroller(1)}
                      aria-label="Scroll promo right"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white text-primary-600 p-2 rounded-full shadow-md hidden md:flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Left/Right fade overlays to hint scrollable content */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-14 bg-gradient-to-r from-white/80 to-transparent dark:from-black/40 hidden md:block rounded-l-2xl" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-14 bg-gradient-to-l from-white/80 to-transparent dark:from-black/40 hidden md:block rounded-r-2xl" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            {isLoading ? (
              // Header skeleton while loading
              <>
                <div className="h-8 w-40 bg-neutral-200 dark:bg-dark-700 rounded mx-auto mb-4 animate-pulse" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-dark-700 rounded mx-auto animate-pulse" />
              </>
            ) : searchQuery ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary-600 mr-2" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
                    Hasil Pencarian
                  </h2>
                </div>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                  Menampilkan hasil untuk: <span className="font-semibold text-primary-600">{"\"" + searchQuery + "\""}</span>
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
          </div>

          <div className="flex">
            {/* Filter Sidebar */}
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onApply={(selectedFilters: Record<string, string[]>, priceRange: { min: number; max: number }) => {
                // Apply filters to current products
                let filtered = products.slice();

                // Category filter (options ids are labels)
                const selectedCategories = selectedFilters['category'] || [];
                if (selectedCategories.length > 0) {
                  filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category));
                }

                // Price filter
                if (priceRange) {
                  filtered = filtered.filter(p => {
                    const price = Number(p.price || 0);
                    return price >= (priceRange.min || 0) && price <= (priceRange.max || Infinity);
                  });
                }

                setFilteredProducts(filtered);
                setIsFilterOpen(false);
              }}
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
              <div className={`grid gap-4 sm:gap-6 ${gridColsClass}`}>
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
                  filteredProducts.map((product: Product) => (
                    <div key={product.id}>
                      <ProductCard product={product} disableAnimations />
                    </div>
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
                        ? 'Tidak ada produk yang cocok dengan "' + searchQuery + '". Coba kata kunci lain.'
                        : 'Produk akan muncul disini setelah admin menambahkannya'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <button className="px-8 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-medium transition-colors">
                  Muat Lebih Banyak Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
