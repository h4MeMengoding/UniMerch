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
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Read URL search params only on client after mount
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('search'));
      setCategoryQuery(params.get('category'));
    } catch (e) {
      // ignore if window is not available
    }
  }, [mounted]);

  // Fetch products and filters on mount. fetchFilters is stable (useCallback), so it's safe to add to deps.
  useEffect(() => {
    fetchProducts();
    fetchFilters();
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
        <div className="pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-0">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Banner Skeleton */}
            <div className="relative h-[calc(100vw*0.21875)] sm:h-[220px] md:h-[250px] lg:h-[280px] overflow-hidden rounded-lg xs:rounded-xl sm:rounded-2xl bg-neutral-200 dark:bg-dark-700 animate-pulse">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      ) : (
        <HeroSection />
      ))}

      {/* Product Listing Section */}
      <section className={(searchQuery || categoryQuery) ? "py-12 pt-24" : "py-6 sm:py-8"}>
        <div className="container mx-auto px-4 max-w-7xl">
      {/* Section Header */}
          {/* Promo Section Skeleton - Show while loading */}
          {isLoading && (
            <div className="mb-6 sm:mb-8">
              {/* Mobile Skeleton */}
              <div className="sm:hidden bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-dark-800 dark:via-dark-900 dark:to-dark-800 rounded-xl overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-700 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-neutral-300 dark:bg-dark-700 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="w-20 h-4 bg-neutral-400 dark:bg-dark-600 rounded-full mb-2"></div>
                      <div className="w-32 h-5 bg-neutral-400 dark:bg-dark-600 rounded mb-1"></div>
                      <div className="w-24 h-6 bg-neutral-400 dark:bg-dark-600 rounded"></div>
                    </div>
                    <div className="w-24 h-20 bg-white dark:bg-dark-800 rounded-lg"></div>
                  </div>
                </div>
                {/* Products Skeleton */}
                <div className="px-4 pb-4">
                  <div className="w-32 h-5 bg-neutral-200 dark:bg-dark-700 rounded mb-3 mt-3"></div>
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-32 min-w-[128px] bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700 overflow-hidden">
                        <div className="aspect-square bg-neutral-200 dark:bg-dark-700"></div>
                        <div className="p-2">
                          <div className="h-3 bg-neutral-200 dark:bg-dark-700 rounded mb-1"></div>
                          <div className="h-3 bg-neutral-200 dark:bg-dark-700 rounded w-3/4 mb-1"></div>
                          <div className="h-4 bg-neutral-200 dark:bg-dark-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Skeleton */}
              <div className="hidden sm:block bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-dark-800 dark:via-dark-900 dark:to-dark-800 rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-700 animate-pulse">
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    {/* Left Promo Panel Skeleton */}
                    <div className="flex-shrink-0 bg-neutral-300 dark:bg-dark-700 rounded-xl lg:rounded-2xl p-4 lg:p-6 w-64 lg:w-72 h-64">
                      <div className="w-24 h-6 bg-neutral-400 dark:bg-dark-600 rounded-full mb-3"></div>
                      <div className="w-40 h-6 bg-neutral-400 dark:bg-dark-600 rounded mb-2"></div>
                      <div className="w-32 h-8 bg-neutral-400 dark:bg-dark-600 rounded mb-4"></div>
                      <div className="w-full h-16 bg-white dark:bg-dark-800 rounded-xl mb-3"></div>
                      <div className="w-3/4 h-3 bg-neutral-400 dark:bg-dark-600 rounded"></div>
                    </div>

                    {/* Products Skeleton */}
                    <div className="flex-1">
                      <div className="w-40 h-6 bg-neutral-200 dark:bg-dark-700 rounded mb-4"></div>
                      <div className="flex gap-3 lg:gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-40 min-w-[160px] lg:w-44 lg:min-w-[176px] bg-white dark:bg-dark-800 rounded-lg lg:rounded-xl border border-neutral-200 dark:border-dark-700 overflow-hidden">
                            <div className="aspect-square bg-neutral-200 dark:bg-dark-700"></div>
                            <div className="p-2.5 lg:p-3">
                              <div className="h-4 bg-neutral-200 dark:bg-dark-700 rounded mb-2"></div>
                              <div className="h-3 bg-neutral-200 dark:bg-dark-700 rounded w-2/3 mb-1"></div>
                              <div className="h-5 bg-neutral-200 dark:bg-dark-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Promo discounted products section - Modern & Responsive Design */}
          {!isLoading && discounted && discounted.length > 0 && (
            <div className="mb-6 sm:mb-8">
              {/* Mobile-First Layout */}
              <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-950 dark:to-dark-900 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm border border-primary-100 dark:border-dark-800">
                
                {/* Promo Header - Mobile */}
                <div className="sm:hidden bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full mb-1.5">
                        <span className="text-sm">🎉</span>
                        <span className="text-[10px] font-semibold text-white">Promo Spesial</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight mb-1">
                        Member baru?<br />Pake kode ini!
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-2xl font-extrabold text-white">10%</p>
                        <p className="text-xs font-semibold text-white/90">Diskon</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 bg-white rounded-lg px-3 py-2 shadow-md min-w-[100px]">
                      <p className="text-[9px] text-neutral-500 font-medium mb-1 text-center">Kode Promo</p>
                      <div className="flex flex-col items-center gap-1.5">
                        <p className="text-xs font-mono font-bold text-primary-700">UNIMERCH</p>
                        <button
                          onClick={() => { 
                            navigator.clipboard?.writeText('UNIMERCH');
                            // Simple toast notification
                            const toast = document.createElement('div');
                            toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in';
                            toast.textContent = '✓ Kode disalin!';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 2000);
                          }}
                          className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors flex items-center gap-1 shadow-sm w-full justify-center"
                          aria-label="Salin kode promo"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Salin
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/70 mt-2">
                    *Berlaku untuk pembelian pertama
                  </p>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center gap-4 lg:gap-6 relative">
                    {/* Left promo panel - Desktop */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 w-64 lg:w-72 shadow-lg relative overflow-hidden">
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -mr-12 lg:-mr-16 -mt-12 lg:-mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-20 h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full -ml-10 lg:-ml-12 -mb-10 lg:-mb-12"></div>
                      
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 lg:mb-3">
                          <span className="text-base lg:text-lg">🎉</span>
                          <span className="text-[10px] lg:text-xs font-semibold text-white">Promo Eksklusif</span>
                        </div>
                        
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-1.5 lg:mb-2 leading-tight">
                          Member baru?<br />Pake kode ini!
                        </h3>
                        
                        <div className="flex items-baseline gap-2 mb-3 lg:mb-4">
                          <p className="text-3xl lg:text-4xl font-extrabold text-white">10%</p>
                          <p className="text-xs lg:text-sm font-semibold text-white/90">Diskon</p>
                        </div>
                        
                        <div className="bg-white/95 dark:bg-white rounded-lg lg:rounded-xl p-2.5 lg:p-3 mb-2.5 lg:mb-3">
                          <p className="text-[9px] lg:text-[10px] text-neutral-600 dark:text-neutral-700 font-medium mb-1">Kode Promo</p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs lg:text-sm font-mono font-bold text-primary-700">UNIMERCH</p>
                            <button
                              onClick={() => { 
                                navigator.clipboard?.writeText('UNIMERCH');
                                // Simple toast notification
                                const toast = document.createElement('div');
                                toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in';
                                toast.textContent = '✓ Kode berhasil disalin!';
                                document.body.appendChild(toast);
                                setTimeout(() => toast.remove(), 2000);
                              }}
                              className="bg-primary-100 hover:bg-primary-200 active:bg-primary-300 text-primary-700 px-2 py-1 rounded-lg text-[10px] lg:text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                              <svg className="w-3 lg:w-3.5 h-3 lg:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Salin
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-[10px] lg:text-xs text-white/70">
                          *Berlaku untuk pembelian pertama
                        </p>
                      </div>
                    </div>

                    {/* Horizontal product scroller */}
                    <div className="flex-1 relative group">
                      <h4 className="text-base lg:text-lg font-bold text-neutral-900 dark:text-white mb-3 lg:mb-4 flex items-center gap-2">
                        <span>🔥</span>
                        Produk Diskon
                      </h4>
                      
                      <div ref={scrollerRef} className="overflow-x-auto no-scrollbar scroll-smooth">
                        <div className="flex items-start gap-3 lg:gap-4 pb-2">
                          {discounted.map((p) => (
                            <div key={p.id} className="w-40 min-w-[160px] lg:w-44 lg:min-w-[176px] bg-white dark:bg-dark-800 rounded-lg lg:rounded-xl border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group/card">
                              <div className="relative aspect-square bg-neutral-50 dark:bg-dark-700 overflow-hidden">
                                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2.5 lg:p-3 group-hover/card:scale-105 transition-transform duration-200" />
                                {((p.originalPrice && p.originalPrice > p.price) || p.isOnSale) && (
                                  <span className="absolute top-1.5 lg:top-2 left-1.5 lg:left-2 bg-red-500 text-white text-[10px] lg:text-xs font-bold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg shadow-md">
                                    -{Math.round(((p.originalPrice ?? p.price) - p.price) / (p.originalPrice ?? p.price) * 100)}%
                                  </span>
                                )}
                              </div>
                              <div className="p-2.5 lg:p-3">
                                <div className="text-xs lg:text-sm font-semibold text-neutral-900 dark:text-white truncate mb-1">{p.name}</div>
                                {p.originalPrice && (
                                  <div className="text-[10px] lg:text-xs text-neutral-500 line-through mb-0.5">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.originalPrice)}
                                  </div>
                                )}
                                <div className="text-sm lg:text-base font-bold text-primary-600 dark:text-primary-400">
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <button
                        onClick={() => scrollScroller(-1)}
                        aria-label="Scroll promo left"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-dark-800 hover:bg-neutral-50 dark:hover:bg-dark-700 text-primary-600 dark:text-primary-400 p-2 rounded-full shadow-lg border border-neutral-200 dark:border-dark-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 lg:w-5 h-4 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => scrollScroller(1)}
                        aria-label="Scroll promo right"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-dark-800 hover:bg-neutral-50 dark:hover:bg-dark-700 text-primary-600 dark:text-primary-400 p-2 rounded-full shadow-lg border border-neutral-200 dark:border-dark-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Product Scroller */}
                <div className="sm:hidden px-4 pb-4">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <span className="text-base">🔥</span>
                    <span>Produk Diskon</span>
                  </h4>
                  
                  <div className="overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4">
                    <div className="flex items-start gap-3 pb-1">
                      {discounted.map((p) => (
                        <div 
                          key={p.id} 
                          className="w-32 min-w-[128px] bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm active:scale-[0.97] transition-transform cursor-pointer"
                          onClick={() => window.location.href = `/product/${p.id}`}
                        >
                          <div className="relative aspect-square bg-neutral-50 dark:bg-dark-700">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                            {((p.originalPrice && p.originalPrice > p.price) || p.isOnSale) && (
                              <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md">
                                -{Math.round(((p.originalPrice ?? p.price) - p.price) / (p.originalPrice ?? p.price) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="text-[11px] font-semibold text-neutral-900 dark:text-white line-clamp-2 mb-1 h-8">{p.name}</div>
                            {p.originalPrice && (
                              <div className="text-[9px] text-neutral-500 line-through mb-0.5">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.originalPrice)}
                              </div>
                            )}
                            <div className="text-xs font-bold text-primary-600 dark:text-primary-400">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Scroll indicator dots - Mobile only */}
                  <div className="flex justify-center gap-1 mt-3">
                    {[...Array(Math.ceil(discounted.length / 3))].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-dark-600"></div>
                    ))}
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
                  // Loading skeletons with shimmer effect
                  Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm">
                      <div className="relative aspect-square bg-neutral-200 dark:bg-dark-700 overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="p-3 sm:p-4 space-y-2">
                        <div className="relative h-4 bg-neutral-200 dark:bg-dark-700 rounded overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="relative h-3 bg-neutral-200 dark:bg-dark-700 rounded w-3/4 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="relative h-6 bg-neutral-200 dark:bg-dark-700 rounded w-1/2 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"></div>
                        </div>
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
