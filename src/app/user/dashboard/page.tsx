'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Star,
  Eye,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { User } from '@/types/user';
import NextImage from 'next/image';

interface Order {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
}

interface UserStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export default function UserDashboard() {
  const { user, isLoading } = useAuthGuard({ requireRole: 'USER' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockOrders: Order[] = [
        {
          id: 1,
          productName: 'Jaket Kampus Premium',
          productImage: '/api/placeholder/400/300',
          quantity: 1,
          price: 150000,
          status: 'delivered',
          orderDate: '2024-10-01',
          estimatedDelivery: '2024-10-05'
        },
        {
          id: 2,
          productName: 'Kaos Polo Universitas',
          productImage: '/api/placeholder/400/300',
          quantity: 2,
          price: 80000,
          status: 'shipped',
          orderDate: '2024-10-02',
          estimatedDelivery: '2024-10-06'
        },
        {
          id: 3,
          productName: 'Tas Ransel Kampus',
          productImage: '/api/placeholder/400/300',
          quantity: 1,
          price: 120000,
          status: 'pending',
          orderDate: '2024-10-03'
        }
      ];

      const mockStats: UserStats = {
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        completedOrders: mockOrders.filter(o => o.status === 'delivered').length,
        totalSpent: mockOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0)
      };

      setOrders(mockOrders);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Unknown';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user || isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Dashboard Saya
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Selamat datang kembali, {user.name}!
          </p>
        </motion.div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            Profil Saya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-600 dark:text-neutral-300">{user.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-600 dark:text-neutral-300">{user.email}</span>
              </div>
            </div>
            <div className="space-y-3">
              {(user as User & { phone?: string })?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-300">{(user as User & { phone?: string }).phone}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total Pesanan
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.totalOrders}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Sedang Diproses
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.pendingOrders}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Selesai
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.completedOrders}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total Belanja
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(stats.totalSpent)}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-sm"
        >
          <div className="p-6 border-b border-neutral-200 dark:border-dark-600">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Pesanan Terbaru
            </h2>
          </div>
          
          <div className="divide-y divide-neutral-200 dark:divide-dark-600">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-6 hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <NextImage
                      src={order.productImage}
                      alt={order.productName}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {order.productName}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Quantity: {order.quantity} | {formatPrice(order.price * order.quantity)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {new Date(order.orderDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {order.estimatedDelivery && order.status === 'shipped' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Estimasi tiba: {new Date(order.estimatedDelivery).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

