'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, QrCode, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QRCode from 'qrcode';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface OrderData {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  userId?: number; // Add userId field
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

export default function PaymentSuccessContent({ searchParams }: { searchParams: { order?: string } }) {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusChecking, setStatusChecking] = useState(false);

  useEffect(() => {
    if (searchParams.order) {
      fetchOrderData(searchParams.order);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.order]);

  // Auto-sync payment status every 10 seconds for unpaid orders
  useEffect(() => {
    if (!orderData || orderData.status === 'DIBAYAR') return;

    const interval = setInterval(async () => {
      await syncPaymentStatus(orderData.orderCode);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  const confirmPaymentImmediately = async (orderCode: string) => {
    try {
      const response = await fetch('/api/payment/confirm-immediate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderCode }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  };

  const syncPaymentStatus = async (orderCode: string) => {
    if (statusChecking) return;
    
    setStatusChecking(true);
    try {
      const response = await fetch('/api/payment/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderCode }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusChanged && orderData) {
          // Update local state with new status
          setOrderData(prev => prev ? {
            ...prev,
            status: result.newStatus
          } : null);
          
          if (result.newStatus === 'DIBAYAR') {
            toast.success('🎉 Pembayaran berhasil dikonfirmasi!');
          }
        }
      }
    } catch {
      // Silent fail - don't show error to user for background sync
    } finally {
      setStatusChecking(false);
    }
  };

  const fetchOrderData = async (orderParam: string) => {
    try {
      let apiUrl = '';
      let isFromXenditRedirect = false;
      
      // Check if orderParam is a raw number (from Xendit redirect) or order code format
      if (/^\d+$/.test(orderParam)) {
        // Raw order ID from Xendit redirect (e.g., "31")
        apiUrl = `/api/orders/${orderParam}`;
        isFromXenditRedirect = true;
      } else {
        // Order code format (e.g., "#05102500031")
        const encodedOrderCode = encodeURIComponent(orderParam);
        apiUrl = `/api/orders/by-code/${encodedOrderCode}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        let orderData = data.order;
        
        // If coming from Xendit redirect and order is not yet marked as paid, confirm payment immediately
        if (isFromXenditRedirect && orderData.status !== 'DIBAYAR') {
          const confirmResult = await confirmPaymentImmediately(orderData.orderCode);
          if (confirmResult.success) {
            orderData = { ...orderData, status: 'DIBAYAR' };
            if (!confirmResult.alreadyPaid) {
              toast.success('🎉 Pembayaran berhasil dikonfirmasi secara otomatis!');
            }
          }
        }
        
        setOrderData(orderData);
        await generateQRCode(orderData);
      } else {
        // Don't log errors to browser console - only show user-friendly messages
        // Technical details are logged in the API/terminal
        
        // Show user-friendly message based on status
        if (response.status === 404) {
          toast.error('Pesanan tidak ditemukan. Silakan periksa kembali nomor pesanan Anda.');
        } else if (response.status === 400) {
          toast.error('Terjadi kesalahan dalam memproses permintaan.');
        } else {
          toast.error('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
        }
      }
    } catch {
      // Don't log errors to browser console - keep UI clean
      toast.error('Terjadi kesalahan saat memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (order: OrderData) => {
    try {
      const qrData = {
        orderId: order.id,
        orderCode: order.orderCode,
        userId: order.user.id, // Use order.user.id from the API response
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.totalAmount,
        timestamp: new Date().toISOString()
      };

      const qrCodeURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataURL(qrCodeURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Gagal membuat QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL || !orderData) return;

    const link = document.createElement('a');
    link.download = `QR-Order-${orderData.orderCode}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code berhasil didownload!');
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }) + ' WIB';
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DIBAYAR': {
        text: 'Dibayar',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      },
      'BELUM_DIBAYAR': {
        text: 'Belum Dibayar',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      },
      'SIAP_DIAMBIL': {
        text: 'Siap Diambil',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      },
      'SUDAH_DIAMBIL': {
        text: 'Sudah Diambil',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      },
      'SELESAI': {
        text: 'Selesai',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      text: status,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      icon: '❓'
    };

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
          {config.text}
        </span>
        {status === 'BELUM_DIBAYAR' && (
          <button
            onClick={() => orderData && syncPaymentStatus(orderData.orderCode)}
            disabled={statusChecking}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Periksa status pembayaran"
          >
            <svg 
              className={`w-4 h-4 ${statusChecking ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 flex flex-col items-center justify-center bg-white dark:bg-dark-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Memuat data pesanan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 bg-gradient-to-br from-primary-50 to-white dark:from-dark-950 dark:to-dark-900 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Pembayaran Berhasil! 🎉
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 leading-relaxed">
            Terima kasih! Pembayaran Anda telah berhasil diproses. Silakan simpan QR code untuk pengambilan barang.
          </p>
        </motion.div>

        {orderData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Order Information - Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-4 sm:space-y-6"
            >
              {/* Order Details Card */}
              <div className="bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Detail Pesanan
                  </h2>
                </div>
                
                <div className="p-4 sm:p-6">
                  {/* Order Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-dark-600">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Nomor Pesanan</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-all sm:break-normal">{orderData.orderCode}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-dark-600">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">Status Pesanan</span>
                        {getStatusBadge(orderData.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-dark-600">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Total Pembayaran</span>
                        <span className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                          Rp {orderData.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-dark-600">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Tanggal Pesanan</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-left sm:text-right">
                          {formatDateTime(orderData.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                      Item Pesanan
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {orderData.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-dark-700 rounded-lg sm:rounded-xl border border-gray-100 dark:border-dark-600 hover:shadow-md transition-all duration-200"
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.product.image || '/api/placeholder/60/60'}
                              alt={item.product.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border-2 border-white dark:border-dark-600 shadow-lg"
                            />
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg line-clamp-2">
                              {item.product.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                              Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* QR Code Section - Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-4 sm:space-y-6"
            >
              <div className="bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden lg:sticky lg:top-8">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    QR Code Pesanan
                  </h2>
                </div>
                
                <div className="p-4 sm:p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed px-2">
                    Simpan QR code ini untuk diserahkan kepada admin saat pengambilan barang
                  </p>
                  
                  {qrCodeDataURL ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-dark-700 dark:to-dark-800 rounded-xl sm:rounded-2xl shadow-inner border-2 border-gray-100 dark:border-dark-600">
                        <img 
                          src={qrCodeDataURL} 
                          alt="QR Code Pesanan" 
                          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <button
                          onClick={downloadQRCode}
                          className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                        >
                          <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Download QR Code
                        </button>
                        
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-primary-800 dark:text-primary-400 font-medium">
                            💡 Tips: Tunjukkan QR code ini kepada admin untuk pengambilan barang yang lebih cepat
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 sm:py-8">
                      <LoadingSpinner size="lg" />
                      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium text-sm">
                        Membuat QR code...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link 
                  href="/user/dashboard?payment=success" 
                  className="flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8" />
                  </svg>
                  Lihat Dashboard
                </Link>
                
                <Link 
                  href="/" 
                  className="flex items-center justify-center border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Belanja Lagi
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Data Tidak Ditemukan
              </h2>
            </div>
            
            <div className="p-6 sm:p-8 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pesanan Tidak Ditemukan
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Maaf, data pesanan tidak dapat ditemukan. Silakan periksa kembali atau hubungi customer service.
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/user/dashboard" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                  </svg>
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}