'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  Package,
  LogOut,
  Settings,
  Bell,
  Search
} from 'lucide-react';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('userToken');
    const user = localStorage.getItem('userData');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    
    // Check if user has ADMIN role
    if (parsedUser.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8%',
      icon: ShoppingBag,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: 'Rp 45,230,000',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Products',
      value: '156',
      change: '+3%',
      icon: Package,
      color: 'bg-purple-500'
    }
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', product: 'Totebag Canvas A', amount: 'Rp 69,000', status: 'Completed' },
    { id: '#ORD-002', customer: 'Jane Smith', product: 'Kaos Desain B', amount: 'Rp 129,000', status: 'Processing' },
    { id: '#ORD-003', customer: 'Mike Johnson', product: 'Bucket Hat Navy', amount: 'Rp 109,000', status: 'Pending' },
    { id: '#ORD-004', customer: 'Sarah Wilson', product: 'Totebag Premium C', amount: 'Rp 99,000', status: 'Completed' },
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
                Admin Dashboard
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Welcome back, Administrator
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white text-sm"
                />
              </div>
              
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
                  <p className="text-green-600 text-sm mt-1">
                    {stat.change} from last month
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
                        {order.customer} • {order.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {order.amount}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : order.status === 'Processing'
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
                  <Package className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Add Product
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <Users className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Manage Users
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <BarChart3 className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    View Reports
                  </p>
                </button>
                
                <button className="p-4 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group">
                  <Settings className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600">
                    Settings
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