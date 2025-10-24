'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shirt, Coffee, Backpack, Gift } from 'lucide-react';

// Banner slider data - lebih banyak untuk demo
const bannerData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=300&fit=crop"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=300&fit=crop"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=300&fit=crop"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=300&fit=crop"
  }
];

// Temporary categories data - akan diganti dengan data dari database
const tempCategories = [
  { id: 1, name: "Pakaian", icon: Shirt },
  { id: 2, name: "Aksesoris", icon: Coffee },
  { id: 3, name: "Tas & Dompet", icon: Backpack },
  { id: 4, name: "Souvenir", icon: Gift },
  { id: 5, name: "Elektronik", icon: Coffee },
  { id: 6, name: "Olahraga", icon: Shirt }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState(tempCategories);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          // Map database data to include default icons
          const categoriesWithIcons = data.map((category: any, index: number) => ({
            ...category,
            icon: tempCategories[index % tempCategories.length]?.icon || Shirt
          }));
          setCategories(categoriesWithIcons);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep using temp data if fetch fails
      }
    };

    fetchCategories();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);
  };

  // Handle touch gestures for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="space-y-0">
      {/* Banner Slider Section - Improved Mobile UI */}
      <section className="relative bg-gray-50 dark:bg-dark-900">
        <div className="relative h-[160px] xs:h-[180px] sm:h-[220px] md:h-[250px] lg:h-[280px] overflow-hidden rounded-lg xs:rounded-xl sm:rounded-2xl mx-1 xs:mx-2 sm:mx-4 lg:mx-6 mt-1 xs:mt-2 sm:mt-4">
          {/* Slider Container */}
          <div 
            className="relative w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="flex h-full"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {bannerData.map((banner, index) => (
                <div
                  key={banner.id}
                  className="min-w-full h-full relative rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden"
                >
                  <img
                    src={banner.image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient overlay - lighter on mobile for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 xs:from-black/10 xs:to-black/10 rounded-lg xs:rounded-xl sm:rounded-2xl" />
                  
                  {/* Event Badge Style - Mobile optimized */}
                  <div className="absolute top-1.5 xs:top-2 sm:top-3 md:top-4 left-1.5 xs:left-2 sm:left-3 md:left-4 bg-white/95 backdrop-blur-sm rounded xs:rounded-md sm:rounded-lg px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 shadow-sm">
                    <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Event #{index + 1}
                    </span>
                  </div>
                  
                  {/* Price Tag Style - Mobile optimized */}
                  <div className="absolute top-1.5 xs:top-2 sm:top-3 md:top-4 right-1.5 xs:right-2 sm:right-3 md:right-4 bg-primary-600 text-white rounded-full px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 shadow-lg">
                    <span className="text-[10px] xs:text-xs sm:text-sm font-bold whitespace-nowrap">
                      Promo
                    </span>
                  </div>

                  {/* Mobile-specific overlay content */}
                  <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3 sm:hidden">
                    <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                      <span className="text-white text-xs font-medium">
                        {index + 1} / {bannerData.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Arrows - Mobile first approach */}
          <button
            onClick={prevSlide}
            className="absolute left-0.5 xs:left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white active:bg-white/80 text-gray-800 p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md touch-manipulation min-w-[32px] min-h-[32px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
            aria-label="Banner sebelumnya"
          >
            <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0.5 xs:right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white active:bg-white/80 text-gray-800 p-1 xs:p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md touch-manipulation min-w-[32px] min-h-[32px] xs:min-w-[36px] xs:min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
            aria-label="Banner selanjutnya"
          >
            <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Slide Indicators - Tiny and Consistent */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-1">
            {bannerData.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1 h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Categories Section - Mobile First Responsive */}
      <section className="bg-white dark:bg-dark-900 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Section Header - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-6"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Kategori Produk
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              Temukan produk sesuai kebutuhan Anda
            </p>
          </motion.div>

          {/* Categories Grid - Mobile First */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
          >
            {categories.slice(0, 6).map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer touch-manipulation"
                >
                  <div className="bg-white dark:bg-dark-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-dark-700 text-center">
                    {/* Icon - Responsive sizing */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1.5 sm:mb-2 md:mb-3">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Category Name - Responsive text */}
                    <h3 className="font-medium text-xs sm:text-sm md:text-sm text-gray-900 dark:text-white leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

