'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Camera, 
  X, 
  Check, 
  RefreshCw,
  AlertCircle,
  Package,
  User,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface QRScanResult {
  orderId: number;
  orderCode: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminScanQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check camera permission on component mount
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.permissions?.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
      }).catch(() => {
        // Permission API not supported, assume prompt
        setCameraPermission('prompt');
      });
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraPermission('granted');
      }

      // Here you would integrate with a QR code scanning library
      // For now, we'll simulate the scanning process
      startQRScanning();

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      setCameraPermission('denied');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startQRScanning = () => {
    // This is where you would integrate with a QR scanner library like:
    // - qr-scanner
    // - jsqr
    // - zxing-js/library
    
    // For demonstration purposes, we'll simulate a scan after 3 seconds
    setTimeout(() => {
      simulateQRDetection();
    }, 3000);
  };

  const simulateQRDetection = async () => {
    try {
      // Try to fetch a valid paid order to simulate scanning
      const response = await fetch('/api/orders?status=DIBAYAR&limit=1');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.orders && data.orders.length > 0) {
          const order = data.orders[0];
          const mockQRData = {
            orderId: order.id,
            orderCode: order.orderCode,
            userId: order.user.id,
            items: order.items || [],
            totalAmount: order.totalAmount,
            timestamp: new Date().toISOString()
          };
          
          handleQRDetected(JSON.stringify(mockQRData));
          return;
        }
      }
      
      // Fallback: create mock data for testing if no paid orders exist
      const mockQRData = {
        orderId: 1,
        orderCode: '#05102500001',
        userId: 1,
        items: [],
        totalAmount: 150000,
        timestamp: new Date().toISOString()
      };
      
      handleQRDetected(JSON.stringify(mockQRData));
      
    } catch (error) {
      console.error('Error simulating QR detection:', error);
      
      // Final fallback: use simple mock data
      const mockQRData = {
        orderId: 1,
        orderCode: '#05102500001',
        userId: 1,
        items: [],
        totalAmount: 150000,
        timestamp: new Date().toISOString()
      };
      
      handleQRDetected(JSON.stringify(mockQRData));
    }
  };

  const handleQRDetected = async (qrData: string) => {
    try {
      setIsProcessing(true);
      
      // Parse QR code data
      const qrInfo = JSON.parse(qrData);
      
      // Validate required fields in QR data
      if (!qrInfo.orderId) {
        setError('QR Code tidak valid: orderId tidak ditemukan');
        return;
      }
      
      // Fetch order details using order ID
      const response = await fetch(`/api/orders/${qrInfo.orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        
        // Check if order is paid
        if (orderData.order.status !== 'DIBAYAR') {
          setError('Pesanan belum dibayar atau sudah selesai');
          return;
        }
        
        // Add orderCode to the order data
        const orderWithCode = {
          ...orderData.order,
          orderCode: qrInfo.orderCode || `#${orderData.order.id.toString().padStart(5, '0')}`
        };
        
        setScanResult(orderWithCode);
        stopCamera();
        toast.success('QR Code berhasil dipindai!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Pesanan tidak ditemukan atau tidak valid');
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError('QR Code tidak valid atau terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  const markAsCompleted = async () => {
    if (!scanResult) return;

    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/admin/orders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: scanResult.orderId }),
      });

      if (response.ok) {
        toast.success('Pesanan berhasil diselesaikan!');
        setScanResult(null);
        // Optionally navigate back to orders page
        router.push('/admin/orders');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menyelesaikan pesanan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyelesaikan pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    if (!isScanning) {
      startCamera();
    }
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

  return (
    <AdminLayout currentPage="scan-qr">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Scan QR Code
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Scan QR code pesanan untuk menyelesaikan transaksi
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Pesanan
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  QR Code Scanner
                </h2>
                {isScanning && (
                  <button
                    onClick={stopCamera}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Camera View */}
              <div className="relative">
                <div className="aspect-square bg-neutral-100 dark:bg-dark-700 rounded-lg overflow-hidden relative">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="border-2 border-primary-500 rounded-lg"
                          style={{ width: '60%', height: '60%' }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>

                      {/* Scanning Animation */}
                      <motion.div
                        className="absolute inset-x-0 h-0.5 bg-primary-500"
                        style={{ top: '20%', left: '20%', right: '20%' }}
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />

                      {/* Processing Overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 flex items-center space-x-3">
                            <LoadingSpinner size="sm" />
                            <span className="text-neutral-900 dark:text-white">Memproses QR Code...</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <QrCode className="w-16 h-16 mb-4" />
                      <p className="text-center">
                        {cameraPermission === 'denied' 
                          ? 'Izin kamera ditolak'
                          : 'Kamera tidak aktif'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Mulai Scan
                  </button>
                ) : (
                  <button
                    onClick={resetScanner}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Reset
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                <p><strong>Cara menggunakan:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Klik &quot;Mulai Scan&quot; untuk mengaktifkan kamera</li>
                  <li>Arahkan kamera ke QR code pesanan</li>
                  <li>Tunggu hingga QR code terdeteksi</li>
                  <li>Konfirmasi penyelesaian pesanan</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Hasil Scan
            </h2>

            {scanResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Order Info */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      QR Code Valid
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    Pesanan {scanResult.orderCode} berhasil ditemukan
                  </p>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Informasi Pelanggan</h3>
                  <div className="bg-neutral-50 dark:bg-dark-700 rounded-lg p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-neutral-900 dark:text-white">{scanResult.user.name}</span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {scanResult.user.email}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Item Pesanan</h3>
                  <div className="space-y-2">
                    {scanResult.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-dark-700 rounded-lg">
                        <img
                          src={item.product.image || '/api/placeholder/40/40'}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900 dark:text-white text-sm">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-neutral-50 dark:bg-dark-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      Rp {scanResult.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {scanResult.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Tanggal:</span>
                    <span className="text-neutral-900 dark:text-white text-xs">
                      {formatDateTime(scanResult.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <button
                  onClick={markAsCompleted}
                  disabled={isProcessing || scanResult.status === 'SELESAI'}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 text-white rounded-lg transition-colors font-medium"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Memproses...</span>
                    </>
                  ) : scanResult.status === 'SELESAI' ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Pesanan Sudah Selesai
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5 mr-2" />
                      Selesaikan Pesanan
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-500 dark:text-neutral-400">
                <QrCode className="w-16 h-16 mb-4" />
                <p className="text-center">
                  Scan QR code pesanan untuk melihat detail
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}