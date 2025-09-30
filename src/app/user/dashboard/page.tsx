'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Package,
  LogOut,
  Settings,
  Bell,
  CreditCard,
  MapPin,
  Clock
} from 'lucide-react';

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const user = localStorage.getItem('userData');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    
    // Check if user has USER role
    if (parsedUser.role !== 'USER') {
      router.push('/login');
      return;
    }

    setUserData(parsedUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const stats = [
    {
      title: 'Total Orders',
      value: '12',
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'Wishlist Items',
      value: '8',
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      title: 'Pending Orders',
      value: '2',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed Orders',
      value: '10',
      icon: Package,
      color: 'bg-green-500'
    }
  ];

  const recentOrders = [
    { id: '#ORD-001', product: 'Totebag Canvas A', amount: 'Rp 69,000', status: 'Delivered', date: '2024-01-15' },
    { id: '#ORD-005', product: 'Kaos Desain B', amount: 'Rp 129,000', status: 'Shipped', date: '2024-01-20' },
    { id: '#ORD-008', product: 'Bucket Hat Navy', amount: 'Rp 109,000', status: 'Processing', date: '2024-01-22' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-neutral-200 dark:border-dark-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                My Dashboard
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Welcome back, {userData?.name || 'User'}!
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-700">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Settings */}
              <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-700">
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700"
          >
            <div className="p-6 border-b border-neutral-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Recent Orders
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {order.id}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {order.product} • {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {order.amount}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700"
          >
            <div className="p-6 border-b border-neutral-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <ShoppingBag className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Shop Now
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <Heart className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Wishlist
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <User className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Profile
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <MapPin className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Addresses
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}