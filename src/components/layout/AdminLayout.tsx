'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Package, 
  Home, 
  Menu, 
  X,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Tags,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function AdminLayout({ children, currentPage = 'dashboard' }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { logout } = useAuth();
  const router = useRouter();

  // Auto-expand menu based on current page
  useEffect(() => {
    const autoExpandMenus = [];
    
    // Check if current page belongs to products submenu
    if (['manage-products', 'categories'].includes(currentPage)) {
      autoExpandMenus.push('products');
    }
    
    // Check if current page belongs to orders submenu
    if (['manage-orders'].includes(currentPage)) {
      autoExpandMenus.push('orders');
    }
    
    setExpandedMenus(autoExpandMenus);
  }, [currentPage]);

  const handleLogout = () => {
    logout(); // This will handle redirect automatically
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      href: '/admin/dashboard'
    },
    {
      id: 'orders',
      name: 'Pesanan',
      icon: ShoppingCart,
      href: '#', // No direct page, only submenu
      submenu: [
        {
          id: 'manage-orders',
          name: 'Kelola Pesanan',
          href: '/admin/orders',
          icon: ClipboardList
        }
      ]
    },
    {
      id: 'products',
      name: 'Produk',
      icon: Package,
      href: '#', // No direct page, only submenu
      submenu: [
        {
          id: 'manage-products',
          name: 'Kelola Produk',
          href: '/admin/products',
          icon: Package
        },
        {
          id: 'categories',
          name: 'Kategori Produk',
          href: '/admin/products/categories',
          icon: Tags
        }
      ]
    }
  ];

  const handleMenuClick = (href: string) => {
    // Don't navigate if href is just a hash (parent menu)
    if (href === '#') return;
    
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Floating */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        aria-label="Buka menu admin"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed left-0 top-16 bottom-0 bg-white dark:bg-dark-800 border-r border-neutral-200 dark:border-dark-700 transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-56'
        }`}
      >
        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.id);
                  } else {
                    handleMenuClick(item.href);
                  }
                }}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative group ${
                  // Check if current page matches any submenu item
                  (item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                {/* Active indicator - vertical line */}
                {((item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"></div>
                )}
                <item.icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${
                  (item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id ? 'text-primary-600' : ''
                }`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.submenu && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        expandedMenus.includes(item.id) ? 'rotate-180' : ''
                      }`} />
                    )}
                  </>
                )}
              </button>

              {/* Submenu Items */}
              {item.submenu && !sidebarCollapsed && (
                <AnimatePresence>
                  {expandedMenus.includes(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => handleMenuClick(subitem.href)}
                          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            currentPage === subitem.id
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-700 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          {subitem.icon && <subitem.icon className="w-4 h-4 mr-3" />}
                          <span>{subitem.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-dark-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors shadow-sm"
        >
          <ChevronLeft
            className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform duration-300 ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-60 bg-white dark:bg-dark-800 shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-dark-700">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
                    UniMerch
                  </h1>
                  <span className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                    Seller
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    {/* Main Menu Item */}
                    <button
                      onClick={() => {
                        if (item.submenu) {
                          toggleSubmenu(item.id);
                        } else {
                          handleMenuClick(item.href);
                        }
                      }}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                        // Check if current page matches any submenu item
                        (item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {/* Active indicator - vertical line */}
                      {((item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"></div>
                      )}
                      <item.icon className={`w-5 h-5 mr-3 ${
                        (item.submenu && item.submenu.some(sub => currentPage === sub.id)) || currentPage === item.id ? 'text-primary-600' : ''
                      }`} />
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.submenu && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenus.includes(item.id) ? 'rotate-180' : ''
                        }`} />
                      )}
                    </button>

                    {/* Submenu Items */}
                    {item.submenu && (
                      <AnimatePresence>
                        {expandedMenus.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.submenu.map((subitem) => (
                              <button
                                key={subitem.id}
                                onClick={() => handleMenuClick(subitem.href)}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  currentPage === subitem.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-700 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                              >
                                {subitem.icon && <subitem.icon className="w-4 h-4 mr-3" />}
                                <span>{subitem.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-3 border-t border-neutral-200 dark:border-dark-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`min-h-screen bg-neutral-50 dark:bg-dark-950 lg:transition-all lg:duration-300 pt-20 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-56'
        }`}
      >
        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </>
  );
}