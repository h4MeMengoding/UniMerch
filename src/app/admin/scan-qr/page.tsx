'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Simple SVG icons
const QrCodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Order data interface
interface OrderData {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  items: Array<{
    id: number;
    productName: string;
    variantName: string | null;
    quantity: number;
    price: number;
  }>;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminScanQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const parseOrderCode = (data: string): string | null => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.orderCode) return parsed.orderCode.toString();
      if (parsed.orderId) return parsed.orderId.toString();
      if (parsed.id) return parsed.id.toString();
    } catch (e) {
      // Not JSON, continue
    }
    
    const trimmed = data.trim();
    
    if (/^#?\d{10,}$/.test(trimmed)) return trimmed;
    if (/^\d{2}-\d{2}-\d{2}-\d{5}$/.test(trimmed)) return trimmed;
    if (/^\d+$/.test(trimmed)) return trimmed;
    
    return null;
  };

  const fetchOrderData = async (orderCode: string) => {
    if (isProcessingRef.current) return;
    
    try {
      isProcessingRef.current = true;
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/orders?search=${encodeURIComponent(orderCode)}`);
      
      if (!response.ok) {
        throw new Error('Order tidak ditemukan');
      }

      const data = await response.json();

      if (data.orders && data.orders.length > 0) {
        const order = data.orders[0];
        setOrderData(order);
        toast.success('Order berhasil ditemukan!');
        await stopScanning();
      } else {
        throw new Error('Order tidak ditemukan di database');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal mengambil data order');
      toast.error(error instanceof Error ? error.message : 'Gagal mengambil data order');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };

  const startScanning = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsScanning(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.getElementById("qr-reader");
      if (!element) {
        throw new Error('QR reader element not found. Please try again.');
      }

      const qrCodeScanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = qrCodeScanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrCodeScanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          const orderCode = parseOrderCode(decodedText);
          if (orderCode) {
            await fetchOrderData(orderCode);
          } else {
            toast.error('QR code tidak valid');
          }
        },
        () => {
          // Scanning errors - ignore
        }
      );

      toast.success('Scanner aktif! Arahkan ke QR code');
    } catch (err) {
      setIsScanning(false);
      setError('Gagal mengaktifkan kamera. Pastikan Anda memberikan izin akses kamera.');
      toast.error('Gagal mengaktifkan kamera');
    } finally {
      setIsLoading(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (err) {
        // Silent fail
      }
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderData) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/orders/${orderData.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Gagal menyelesaikan pesanan');
      }

      toast.success('Pesanan berhasil diselesaikan!');
      setOrderData(null);
      await startScanning();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyelesaikan pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setOrderData(null);
    setError(null);
    isProcessingRef.current = false;
    await stopScanning();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <QrCodeIcon className="w-8 h-8" />
              Scan QR Code Pesanan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Scan QR code untuk melihat detail dan menyelesaikan pesanan
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!orderData ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Scanner Container */}
                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  {!isScanning ? (
                    <div className="text-center py-12">
                      <QrCodeIcon className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Siap untuk Scan
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Klik tombol di bawah untuk mengaktifkan scanner
                      </p>
                      <button
                        onClick={startScanning}
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? 'Memuat...' : 'Mulai Scan'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* QR Reader Container */}
                      <div 
                        id="qr-reader" 
                        className="rounded-lg overflow-hidden border-4 border-blue-500 dark:border-blue-400"
                      />
                      
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Arahkan kamera ke QR code
                        </p>
                        <button
                          onClick={handleReset}
                          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="order-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Order Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Detail Pesanan
                    </h2>
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                      {orderData.orderCode}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Informasi Pelanggan
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{orderData.user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{orderData.user.email}</p>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Item Pesanan
                    </h3>
                    <div className="space-y-2">
                      {orderData.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </p>
                            {item.variantName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Varian: {item.variantName}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Status */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Status Pembayaran:</span>
                      <span className={`font-semibold ${
                        orderData.paymentStatus === 'PAID' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {orderData.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-gray-900 dark:text-white">
                        Rp {orderData.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Scan Lagi
                    </button>
                    {orderData.status !== 'COMPLETED' && (
                      <button
                        onClick={handleCompleteOrder}
                        disabled={isLoading || orderData.paymentStatus !== 'PAID'}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          'Memproses...'
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Selesaikan Pesanan
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
