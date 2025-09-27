'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingCart, User, Heart, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Toko', href: '/shop' },
    { label: 'Kategori', href: '/categories' },
    { label: 'Tentang', href: '/about' },
    { label: 'Kontak', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-dark-700 transition-colors duration-300">
      <nav className="container mx-auto px-4 lg:px-6" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.a
              href="/"
              className="text-2xl font-bold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="UniMerch - Beranda"
            >
              UniMerch
            </motion.a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                whileHover={{ y: -1 }}
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <motion.button
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Cari produk"
            >
              <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Ganti tema"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-neutral-700" /> : <Sun className="w-5 h-5 text-neutral-300" />}
            </motion.button>

            {/* Wishlist */}
            <motion.button
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </motion.button>

            {/* Cart */}
            <motion.button
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Keranjang belanja (3 item)"
            >
              <ShoppingCart className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </motion.button>

            {/* User Account */}
            <motion.button
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Akun pengguna"
            >
              <User className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart */}
            <motion.button
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Keranjang belanja (3 item)"
            >
              <ShoppingCart className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </motion.button>

            {/* Menu Toggle */}
            <motion.button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-neutral-200 dark:border-dark-700 bg-white dark:bg-dark-900"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-dark-800 rounded-md transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="border-t border-neutral-200 dark:border-dark-700 pt-4">
                  <div className="flex items-center justify-around">
                    <motion.button
                      className="flex flex-col items-center space-y-1 p-3 rounded-md hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cari produk"
                    >
                      <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Cari</span>
                    </motion.button>

                    <motion.button
                      onClick={toggleTheme}
                      className="flex flex-col items-center space-y-1 p-3 rounded-md hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Ganti tema"
                    >
                      {theme === 'light' ? <Moon className="w-5 h-5 text-neutral-700" /> : <Sun className="w-5 h-5 text-neutral-300" />}
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Tema</span>
                    </motion.button>

                    <motion.button
                      className="flex flex-col items-center space-y-1 p-3 rounded-md hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Wishlist"
                    >
                      <Heart className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Wishlist</span>
                      <span className="absolute top-1 right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        2
                      </span>
                    </motion.button>

                    <motion.button
                      className="flex flex-col items-center space-y-1 p-3 rounded-md hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Akun pengguna"
                    >
                      <User className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Akun</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
