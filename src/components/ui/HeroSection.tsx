'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shirt, Coffee, Backpack, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CategoryShape = {
  id: number;
  name: string;
};

// Banner slider data - lebih banyak untuk demo
const bannerData = [
  {
    id: 1,
    image: "https://i.ibb.co.com/BVSVFpYB/banner.png"
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<CategoryShape[]>([]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const router = useRouter();

  // Handle category click to navigate to products
  const handleCategoryClick = (category: CategoryShape) => {
    // Navigate to products page with category filter
    router.push(`/?category=${encodeURIComponent(category.name)}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories from database - using admin pattern
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          console.log('Categories API response:', data); // Debug log
          
          // Use the same pattern as admin page
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
            console.log('Set categories:', data.categories);
          } else {
            console.warn('Categories not found in response or not an array:', data);
            setCategories([]);
          }
        } else {
          console.error('Failed to fetch categories, status:', response.status);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
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
      {/* Banner Slider Section - Clean Integration */}
      <section className="relative pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative h-[160px] xs:h-[180px] sm:h-[220px] md:h-[250px] lg:h-[280px] overflow-hidden rounded-lg xs:rounded-xl sm:rounded-2xl">
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
        </div>
      </section>

      {/* Categories Section - Database Only */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Categories Grid - Centered with Click */}
          {Array.isArray(categories) && categories.length > 0 ? (
            <div className="flex justify-center">
              <div className="flex overflow-x-auto scrollbar-hide space-x-3 sm:space-x-4 pb-2 max-w-full">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 bg-white dark:bg-dark-800 rounded-full px-3 py-2 shadow-sm border border-gray-200 dark:border-dark-600">
                      {/* Consistent Icon */}
                      <span className="text-lg">🏷️</span>
                      
                      {/* Category Name */}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Memuat kategori...
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

