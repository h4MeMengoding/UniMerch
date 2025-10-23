'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

interface Order {
  id: number; // Changed from string to number to match database
  status: 'BELUM_DIBAYAR' | 'DIBAYAR' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'SELESAI';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    id: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
    paymentUrl?: string;
    xenditInvoiceId: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface PaymentUpdate {
  orderId: number;
  oldOrderStatus: string;
  newOrderStatus: string;
  oldPaymentStatus: string;
  newPaymentStatus: string;
}

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const lastPaymentCheckRef = useRef<number>(0);

  // Format order code helper function - CONSISTENT with API format
  const formatOrderCode = (orderId: number, createdAt: string) => {
    try {
      const date = new Date(createdAt);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for order code:', createdAt);
        return `#${String(orderId).padStart(8, '0')}`; // Fallback to old format
      }
      
      // Use SAME format as API: DD-MM-YY-NNNNN (Day-Month-Year-OrderID)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const id = String(orderId).padStart(5, '0');
      
      return `#${day}${month}${year}${id}`;
    } catch (error) {
      console.error('Error formatting order code:', error);
      return `#${String(orderId).padStart(8, '0')}`; // Fallback to old format
    }
  };

  // Format date with time helper function
  const formatDateTime = (dateString: string) => {
    try {
      let date: Date;
      
      if (dateString.includes('T') || dateString.includes('Z')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Tanggal tidak valid';
      }
      
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
      };
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
        hour12: false
      };
      
      const dateStr = date.toLocaleDateString('id-ID', dateOptions);
      const timeStr = date.toLocaleTimeString('id-ID', timeOptions);
      
      return `${dateStr} pukul ${timeStr} WIB`;
    } catch (error) {
      console.error('Error formatting datetime:', error, 'for dateString:', dateString);
      return 'Tanggal tidak valid';
    }
  };

  // Calculate statistics from orders
  const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const sedangDiproses = orders.filter(order => 
      order.status === 'BELUM_DIBAYAR' || 
      order.status === 'DIBAYAR'
    ).length;
    const selesai = orders.filter(order => 
      order.status === 'SUDAH_DIAMBIL' || 
      order.status === 'SELESAI'
    ).length;
    const totalBelanja = orders
      .filter(order => order.status !== 'BELUM_DIBAYAR')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      totalOrders,
      sedangDiproses,
      selesai,
      totalBelanja
    };
  };

  const stats = calculateStats(orders);

  const fetchOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const showStatusUpdateNotification = useCallback((update: PaymentUpdate) => {
    // Find the order to get created date for proper code formatting
    const order = orders.find(o => o.id === update.orderId);
    const orderCode = order ? formatOrderCode(update.orderId, order.createdAt) : `#${String(update.orderId).padStart(8, '0')}`;
    const message = `Pesanan ${orderCode} - Status pembayaran diperbarui: ${update.newPaymentStatus === 'PAID' ? 'Dibayar' : update.newPaymentStatus}`;
    
    // Show success notification using react-toastify
    toast.success(message);
  }, [orders]);

  const checkPaymentStatus = useCallback(async () => {
    // Throttle API calls - don't call if called within last 10 seconds
    const now = Date.now();
    const lastCall = lastPaymentCheckRef.current;
    
    if (now - lastCall < 10000) { // 10 seconds throttle
      console.log('Payment status check throttled');
      return;
    }
    
    lastPaymentCheckRef.current = now;
    
    try {
      const response = await fetch('/api/payment/check-status');
      if (response.ok) {
        const result = await response.json();
        
        if (result.updates && result.updates.length > 0) {
          console.log('Payment status updates found:', result.updates);
          
          // Show notification for status updates
          result.updates.forEach((update: PaymentUpdate) => {
            if (update.oldPaymentStatus !== update.newPaymentStatus) {
              showStatusUpdateNotification(update);
            }
          });
          
          // Refresh orders data
          await fetchOrders(false);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [fetchOrders, showStatusUpdateNotification]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh for pending payments - Optimized polling
  useEffect(() => {
    const hasPendingPayments = orders.some(order => 
      order.status === 'BELUM_DIBAYAR' || (order.payment && order.payment.status === 'PENDING')
    );

    if (hasPendingPayments) {
      // Start with moderate polling (30 seconds)
      const interval = setInterval(() => {
        checkPaymentStatus(); // Check payment status and refresh if needed
      }, 30000); // Check every 30 seconds to reduce server load

      return () => {
        clearInterval(interval);
      };
    }
  }, [orders, checkPaymentStatus]);

  // Real-time refresh when coming back from payment
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is visible again, refresh orders immediately
        fetchOrders(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrders]);

  // Payment success notification with optimized refresh
  useEffect(() => {
    const paymentParam = searchParams.get('payment');
    if (paymentParam === 'success') {
      
      // Immediately refresh orders data
      fetchOrders(false);
      
      // Check payment status once after 5 seconds
      const timeoutId = setTimeout(() => {
        checkPaymentStatus();
      }, 5000);
      
      // Set up moderate polling for next 2 minutes only
      const moderateInterval = setInterval(() => {
        checkPaymentStatus();
      }, 15000); // Every 15 seconds
      
      // Stop moderate polling after 2 minutes
      const stopTimeoutId = setTimeout(() => {
        clearInterval(moderateInterval);
      }, 120000); // 2 minutes
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(stopTimeoutId);
        clearInterval(moderateInterval);
      };
    }
  }, [searchParams, fetchOrders, checkPaymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-dark-950">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard Saya
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Kelola pesanan dan profile Anda
          </p>
        </div>
      </div>

      {/* Last updated indicator */}
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">Total Pesanan</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalOrders}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">Sedang Diproses</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.sedangDiproses}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">Selesai</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.selesai}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">Total Belanja</p>
              <p className="text-sm sm:text-base lg:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Rp {stats.totalBelanja.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0 ml-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 sm:mb-6">
          Riwayat Pesanan
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 dark:text-neutral-500 text-lg">
              Belum ada pesanan
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Pesanan Anda akan muncul di sini setelah melakukan pembelian
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
                      Pesanan {formatOrderCode(order.id, order.createdAt)}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-2">
                    <div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        order.status === 'DIBAYAR' ? 'bg-green-100 text-green-800' :
                        order.status === 'BELUM_DIBAYAR' ? 'bg-red-100 text-red-800' :
                        order.status === 'SIAP_DIAMBIL' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SUDAH_DIAMBIL' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status === 'BELUM_DIBAYAR' ? 'Belum Dibayar' :
                         order.status === 'DIBAYAR' ? 'Dibayar' :
                         order.status === 'SIAP_DIAMBIL' ? 'Siap Diambil' :
                         order.status === 'SUDAH_DIAMBIL' ? 'Sudah Diambil' :
                         'Selesai'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-neutral-50 dark:bg-dark-800 rounded-lg">
                      <img
                        src={item.product.image || '/api/placeholder/80/80'}
                        alt={item.product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-100 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                          Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons for pending payments */}
                {order.status === 'BELUM_DIBAYAR' && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <a
                      href={order.payment?.paymentUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                    >
                      Bayar Sekarang
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6v6M10 14L20 4" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}