'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-dark-900 dark:to-dark-800 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Koleksi Baru 2025
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white leading-tight"
              >
                Jelajahi
                <span className="text-primary-600 dark:text-primary-400"> Merchandise </span>
                Universitas
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg"
              >
                Temukan merchandise universitas terbaru dengan harga terjangkau dan kualitas terbaik. 
                Pengalaman belanja sempurna dimulai dari sini.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Belanja Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                className="border-2 border-neutral-300 dark:border-dark-600 hover:border-neutral-400 dark:hover:border-dark-500 text-neutral-700 dark:text-neutral-300 px-6 py-3 rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Lihat Kategori
              </motion.button>
            </motion.div>

            {/* Stats - More compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200 dark:border-dark-700"
            >
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">10K+</div>
                <div className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">Pelanggan Puas</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">5K+</div>
                <div className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">Produk</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">99%</div>
                <div className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">Kepuasan</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image - More compact */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square lg:aspect-[1/1] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 dark:from-primary-900/30 to-primary-200 dark:to-primary-800/30 max-w-md mx-auto">
              {/* Placeholder for hero image - smaller */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-48 h-48 bg-white rounded-2xl shadow-2xl flex items-center justify-center"
                >
                  <ShoppingBag className="w-24 h-24 text-primary-600" />
                </motion.div>
              </div>

              {/* Floating Elements - smaller */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-6 right-6 w-12 h-12 bg-yellow-400 rounded-xl shadow-lg"
              />
              
              <motion.div
                animate={{ 
                  y: [0, 12, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-8 left-6 w-10 h-10 bg-green-400 rounded-full shadow-lg"
              />
              
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  x: [0, 4, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute top-1/3 left-3 w-6 h-6 bg-pink-400 rounded-lg shadow-lg"
              />
            </div>

            {/* Background Decorations - smaller */}
            <div className="absolute -top-3 -right-3 w-24 h-24 bg-primary-200 rounded-full opacity-20 -z-10" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-yellow-200 rounded-full opacity-20 -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
    </section>
  );
}
