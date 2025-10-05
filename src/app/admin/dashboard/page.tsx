'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  status: string;
  totalAmount: number;
}
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  // Protect this route - require ADMIN role
  const { isLoading: authLoading } = useAuthGuard({
    requireAuth: true,
    requireRole: 'ADMIN'
  });
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    // Fetch actual stats from APIs
    Promise.all([
      fetch('/api/admin/products').then(res => res.json()),
      fetch('/api/admin/orders').then(res => res.json()),
      fetch('/api/admin/users').then(res => res.json()).catch(() => ({ users: [] }))
    ]).then(([productsData, ordersData, usersData]) => {
      const orders = ordersData.orders || [];
      const totalRevenue = orders
        .filter((order: Order) => order.status !== 'BELUM_DIBAYAR')
        .reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
      
      const pendingOrders = orders.filter((order: Order) => 
        order.status === 'DIBAYAR' || order.status === 'SIAP_DIAMBIL'
      ).length;
      
      const completedOrders = orders.filter((order: Order) => 
        order.status === 'SUDAH_DIAMBIL' || order.status === 'SELESAI'
      ).length;

      setStats({
        totalProducts: Array.isArray(productsData) ? productsData.length : 0,
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: Array.isArray(usersData.users) ? usersData.users.length : 0,
        pendingOrders,
        completedOrders
      });
    }).catch(console.error);

    setIsLoading(false);
  }, [authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            {authLoading ? 'Memverifikasi akses...' : 'Memuat dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  const cardStats = [
    {
      title: 'Total Produk',
      value: stats.totalProducts.toString(),
      change: `${stats.totalProducts} produk tersedia`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/products'
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders.toString(),
      change: `${stats.pendingOrders} perlu diproses`,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/orders'
    },
    {
      title: 'Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      change: `Dari ${stats.completedOrders} pesanan selesai`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/admin/orders'
    },
    {
      title: 'Total Pengguna',
      value: stats.totalUsers.toString(),
      change: `${stats.totalUsers} pengguna terdaftar`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '#'
    }
  ];

  const quickActions = [
    {
      title: 'Kelola Pesanan',
      description: 'Lihat dan update status pesanan pelanggan',
      icon: ShoppingBag,
      color: 'bg-green-600 hover:bg-green-700',
      href: '/admin/orders'
    },
    {
      title: 'Kelola Produk',
      description: 'Tambah, edit, dan hapus produk merchandise',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: '/admin/products'
    },
    {
      title: 'Lihat Toko',
      description: 'Buka halaman utama toko untuk melihat tampilan customer',
      icon: Eye,
      color: 'bg-purple-600 hover:bg-purple-700',
      href: '/'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Selamat Datang, Admin! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Kelola toko merchandise UNNES dengan mudah dari dashboard ini.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.href && stat.href !== '#' && (
                <button
                  onClick={() => router.push(stat.href)}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  Lihat Detail
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                disabled={action.href === '#'}
                className={`p-4 rounded-lg text-white text-left transition-colors ${action.color} ${
                  action.href === '#' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <action.icon className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Produk &quot;Totebag Canvas A&quot; ditambahkan
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    2 jam yang lalu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Stok &quot;Kaos Desain B&quot; diperbarui
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    5 jam yang lalu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-dark-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Database produk di-seed dengan 8 item
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    1 hari yang lalu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}