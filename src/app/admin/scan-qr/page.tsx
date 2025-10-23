'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode,
  ArrowLeft,
  Camera,
  CheckCircle,
  User,
  Package,
  CreditCard,
  AlertCircle,
  RefreshCw,
  X,
  Scan,
  Shield,
  Zap,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

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
    } catch {
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
    } catch {
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
      } catch {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">
          {/* Simple Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>
            
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Scanner
              </h1>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {!orderData ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Scanner */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {!isScanning ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-lg flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-white" />
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        Scan QR Code
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Aktifkan scanner untuk memindai QR code pesanan
                      </p>
                      
                      <button
                        onClick={startScanning}
                        disabled={isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Memuat...
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5" />
                            Mulai Scan
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="mb-6">
                        <div 
                          id="qr-reader" 
                          className="rounded-lg overflow-hidden border-2 border-blue-600"
                        />
                      </div>
                      
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="font-medium">Scanner Aktif</span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Posisikan QR code di dalam frame
                        </p>
                        
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <X className="w-4 h-4" />
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fitur Scanner */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Scan className="w-4 h-4 text-blue-600" />
                      Fitur Scanner
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Detection</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Deteksi otomatis QR code pembeli</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Fast Scanner</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tanpa harus menunggu lama</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Real-time</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pemindaian cepat dan akurat</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keamanan & Tips */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Tips Penggunaan
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Pencahayaan Cukup</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pastikan area scan memiliki cahaya yang baik</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Jarak Optimal</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Jaga jarak 15-30 cm dari QR code</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Kamera Stabil</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tahan kamera dengan stabil saat scan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="order-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    QR Code Berhasil Dipindai! ✅
                  </h1>
                  
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Pesanan ditemukan dan siap diproses. Periksa detail pesanan di bawah ini.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Information - Left Column */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                  >
                    {/* Order Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-blue-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                          <Package className="w-5 h-5 mr-3" />
                          Detail Pesanan
                        </h2>
                      </div>
                      
                      <div className="p-6">
                        {/* Order Summary Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Nomor Pesanan</span>
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">{orderData.orderCode}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">Status Pesanan</span>
                              <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                orderData.paymentStatus === 'PAID' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                                {orderData.paymentStatus}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Total Pembayaran</span>
                              <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                Rp {orderData.totalAmount.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 dark:border-gray-600">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">Tanggal Pesanan</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white text-left sm:text-right">
                                {formatDate(orderData.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-8">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-500" />
                            Informasi Pelanggan
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                            <div className="flex items-center">
                              <span className="text-gray-900 dark:text-white font-medium">{orderData.user.name}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-600 dark:text-gray-400">{orderData.user.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-blue-500" />
                            Item Pesanan ({orderData.items.length})
                          </h3>
                          <div className="space-y-4">
                            {orderData.items.map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600"
                              >
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-base">
                                    {item.productName}
                                  </h4>
                                  {item.variantName && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      Varian: {item.variantName}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-base font-medium text-gray-900 dark:text-white">
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

                  {/* Quick Stats & Actions - Right Column */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1 space-y-6"
                  >
                    {/* Quick Stats Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-green-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                          <Zap className="w-5 h-5 mr-3" />
                          Statistik Cepat
                        </h2>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{orderData.items.length}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Items</p>
                          </div>
                          
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {orderData.paymentStatus === 'PAID' ? '✓' : '⏳'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Payment</p>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <CheckCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {orderData.status === 'COMPLETED' ? '✓' : '○'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                          </div>
                          
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {new Date(orderData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Tanggal</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-purple-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                          <CheckCircle className="w-5 h-5 mr-3" />
                          Aksi Pesanan
                        </h2>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <button
                          onClick={handleReset}
                          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-5 h-5" />
                          Scan QR Lagi
                        </button>
                        
                        {orderData.status !== 'COMPLETED' && (
                          <button
                            onClick={handleCompleteOrder}
                            disabled={isLoading || orderData.paymentStatus !== 'PAID'}
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Selesaikan Pesanan
                              </>
                            )}
                          </button>
                        )}
                        
                        {orderData.paymentStatus !== 'PAID' && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                              ⚠️ Pesanan ini belum dibayar. Pastikan pembayaran selesai sebelum menyerahkan barang.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}