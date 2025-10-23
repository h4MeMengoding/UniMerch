'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingCart, User, Heart, Sun, Moon, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Show theme tooltip after 2 seconds on desktop only
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show on desktop and in light mode
      if (window.innerWidth >= 768 && theme === 'light') {
        setShowThemeTooltip(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [theme]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileOpen && !target.closest('[data-profile-dropdown]')) {
        setIsProfileOpen(false);
      }
      // Also close theme tooltip when clicking outside
      if (showThemeTooltip && !target.closest('[data-theme-toggle]')) {
        setShowThemeTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, showThemeTooltip]);

  const handleLogin = () => {
    router.push('/login');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // This will handle redirect automatically
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleProfile = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Toko', href: '/shop' },
    { label: 'Kategori', href: '/categories' },
    { label: 'Tentang', href: '/about' },
    { label: 'Kontak', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-dark-700 transition-colors duration-300">
      <nav className="container mx-auto px-4 lg:px-6" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-16 sm:h-20">
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
            <div className="relative" data-theme-toggle>
              <motion.button
                onClick={() => {
                  toggleTheme();
                  setShowThemeTooltip(false);
                }}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Ganti tema"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-neutral-700" /> : <Sun className="w-5 h-5 text-neutral-300" />}
              </motion.button>
            </div>

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

            {/* User Profile */}
            <div className="relative" data-profile-dropdown>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Profile pengguna"
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="hidden lg:block w-4 h-4 text-neutral-500" />
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                    <span className="hidden lg:block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Login
                    </span>
                  </>
                )}
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-neutral-200 dark:border-dark-700 py-2 z-50"
                  >
                    {user ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-dark-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {user.name || user.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {user.email}
                              </p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {user.role === 'ADMIN' ? 'Admin' : 'User'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={handleProfile}
                            className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                          >
                            <UserCircle className="w-4 h-4 mr-3" />
                            {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Profile Saya'}
                          </button>
                          
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => {
                                router.push('/user/settings');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Pengaturan
                            </button>
                          )}
                        </div>

                        <div className="border-t border-neutral-100 dark:border-dark-700 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Not Logged In */}
                        <div className="px-4 py-3">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            Masuk untuk mengakses fitur lengkap
                          </p>
                          <button
                            onClick={handleLogin}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Masuk / Daftar
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                      onClick={() => {
                        if (user) {
                          handleProfile();
                        } else {
                          handleLogin();
                        }
                        setIsMenuOpen(false);
                      }}
                      className="flex flex-col items-center space-y-1 p-3 rounded-md hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={user ? "Profile" : "Login"}
                    >
                      {user ? (
                        <>
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {user.name?.split(' ')[0] || 'Profile'}
                          </span>
                          {user.role === 'ADMIN' && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              A
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <User className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Login</span>
                        </>
                      )}
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
