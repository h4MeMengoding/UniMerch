'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Heart, Sun, Moon, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  // mobile menu removed — mobile navigation is handled by `MobileBottomNav`
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
  };

  const handleLogout = () => {
    logout(); // This will handle redirect automatically
    setIsProfileOpen(false);
  };

  const handleProfile = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
    setIsProfileOpen(false);
  };

  // no-op: mobile menu removed

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page with query
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Generate random avatar URL using user's email or name as seed
  const generateAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  // Get first name only
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  // Get role display text
  const getRoleText = (role: string | undefined) => {
    return role === 'ADMIN' ? 'Penjual' : 'Pembeli';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-dark-700 transition-colors duration-300">
      <nav className="container mx-auto px-4 max-w-7xl" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.a
              href="/"
              className="block hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="UniMerch - Beranda"
            >
              {/* Light mode logo */}
              <img
                src="/header-brand.svg"
                alt="UniMerch"
                className="h-10 sm:h-12 lg:h-14 w-auto dark:hidden"
              />
              {/* Dark mode logo */}
              <img
                src="/header-brand-dark.svg"
                alt="UniMerch"
                className="h-10 sm:h-12 lg:h-14 w-auto hidden dark:block"
              />
            </motion.a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-full text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Cari
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
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
                className="flex items-center space-x-3 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Profile pengguna"
              >
                {user ? (
                  <>
                    <img
                      src={generateAvatarUrl(user.email || user.name || 'default')}
                      alt="Profile Avatar"
                      className="w-10 h-10 rounded-full border-2 border-primary-200 dark:border-primary-600"
                    />
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {getFirstName(user.name) || user.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {getRoleText(user.role)}
                      </span>
                    </div>
                    <ChevronDown className="hidden lg:block w-4 h-4 text-neutral-500" />
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-neutral-200 dark:bg-dark-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Masuk
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Untuk berbelanja
                      </span>
                    </div>
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
                            <img
                              src={generateAvatarUrl(user.email || user.name || 'default')}
                              alt="Profile Avatar"
                              className="w-12 h-12 rounded-full border-2 border-primary-200 dark:border-primary-600"
                            />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {getFirstName(user.name) || user.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {user.email}
                              </p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                user.role === 'ADMIN' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {getRoleText(user.role)}
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
                                router.push('/user/orders');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4 mr-3" />
                              Pesanan
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
            {/* Mobile Profile */}
            <div className="relative" data-profile-dropdown>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Profile pengguna"
              >
                {user ? (
                  <img
                    src={generateAvatarUrl(user.email || user.name || 'default')}
                    alt="Profile Avatar"
                    className="w-8 h-8 rounded-full border-2 border-primary-200 dark:border-primary-600"
                  />
                ) : (
                  <div className="w-8 h-8 bg-neutral-200 dark:bg-dark-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                )}
              </motion.button>

              {/* Mobile Profile Dropdown */}
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
                            <img
                              src={generateAvatarUrl(user.email || user.name || 'default')}
                              alt="Profile Avatar"
                              className="w-12 h-12 rounded-full border-2 border-primary-200 dark:border-primary-600"
                            />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {getFirstName(user.name) || user.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {user.email}
                              </p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                user.role === 'ADMIN' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {getRoleText(user.role)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleProfile();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                          >
                            <UserCircle className="w-4 h-4 mr-3" />
                            {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Profile Saya'}
                          </button>
                          
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => {
                                router.push('/user/orders');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4 mr-3" />
                              Pesanan
                            </button>
                          )}
                        </div>

                        <div className="border-t border-neutral-100 dark:border-dark-700 pt-1">
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsProfileOpen(false);
                            }}
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
                            onClick={() => {
                              handleLogin();
                              setIsProfileOpen(false);
                            }}
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
        </div>
      </nav>
    </header>
  );
}
