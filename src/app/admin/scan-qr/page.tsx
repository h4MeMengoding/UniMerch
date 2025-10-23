'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Simple SVG icons
const QrCodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const VideoCameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

// Order data interface for API responses
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  // Cleanup camera function
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped camera track:', track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    console.log('✅ Camera cleaned up');
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCameraLoading(true); // Show loading state
      console.log('📹 Starting camera...');

      // Set camera active state first to render video element
      setIsCameraActive(true);
      
      // Wait a bit for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 150));

      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API tidak tersedia di browser ini');
      }

      // Check if video element is ready
      if (!videoRef.current) {
        console.error('❌ Video element not found');
        throw new Error('Video element tidak tersedia');
      }

      // Try to get camera stream
      let stream: MediaStream | null = null;
      
      // Try environment facing camera first (back camera on mobile)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        console.log('✅ Got environment camera');
      } catch (err) {
        console.log('❌ Environment camera failed, trying default camera');
        
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        console.log('✅ Got default camera');
      }

      if (stream && videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready and play
        try {
          await videoRef.current.play();
          console.log('✅ Camera video playing');
          setIsCameraLoading(false); // Hide loading state
          toast.success('Kamera berhasil diaktifkan');
        } catch (playError) {
          console.error('❌ Video play error:', playError);
          // Try alternative approach
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => {
                setIsCameraLoading(false);
                toast.success('Kamera berhasil diaktifkan');
              })
              .catch(e => {
                console.error('Play error:', e);
                setIsCameraLoading(false);
              });
          };
        }
      } else {
        throw new Error('Gagal mendapatkan stream kamera');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      setIsCameraActive(false); // Reset state on error
      setIsCameraLoading(false); // Hide loading state
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      toast.error('Gagal mengakses kamera');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    cleanupCamera();
    setIsCameraActive(false);
    console.log('📹 Camera stopped');
  }, [cleanupCamera]);

  // Parse order code from QR data
  const parseOrderCode = (data: string): string | null => {
    console.log('🔍 Parsing QR data:', data);
    
    try {
      // Try JSON format first
      const parsed = JSON.parse(data);
      console.log('✅ Successfully parsed JSON:', parsed);
      
      if (parsed.orderCode && typeof parsed.orderCode === 'string') {
        console.log('✅ Found orderCode in JSON:', parsed.orderCode);
        return parsed.orderCode;
      }
      
      if (parsed.orderId) {
        console.log('✅ Found orderId in JSON:', parsed.orderId);
        return parsed.orderId.toString();
      }
      
      if (parsed.userId) {
        console.log('⚠️ Using userId as fallback:', parsed.userId);
        return parsed.userId.toString();
      }
    } catch (parseError) {
      console.log('📝 Not JSON format, trying other formats...');
    }
    
    // Check if it's a direct order code (format: DD-MM-YY-NNNNN)
    const orderCodePattern = /^\d{2}-\d{2}-\d{2}-\d{5}$/;
    if (orderCodePattern.test(data.trim())) {
      console.log('✅ Direct order code detected:', data.trim());
      return data.trim();
    }
    
    // Check if it's just a number (numeric ID)
    const numericPattern = /^\d+$/;
    if (numericPattern.test(data.trim())) {
      console.log('✅ Numeric ID detected:', data.trim());
      return data.trim();
    }
    
    // Check for order code pattern anywhere in the string
    const orderCodeMatch = data.match(/\d{2}-\d{2}-\d{2}-\d{5}/);
    if (orderCodeMatch) {
      console.log('✅ Order code pattern found in string:', orderCodeMatch[0]);
      return orderCodeMatch[0];
    }
    
    // Check for any sequence of 8+ digits
    const longNumericMatch = data.match(/\d{8,}/);
    if (longNumericMatch) {
      console.log('✅ Long numeric sequence found:', longNumericMatch[0]);
      return longNumericMatch[0];
    }
    
    console.log('❌ No valid order format found in data');
    return null;
  };

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isCameraActive) {
      toast.error('Kamera tidak aktif');
      return;
    }

    try {
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState < 2) {
        toast.error('Video belum siap, tunggu sebentar');
        return;
      }

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageDataUrl);
      
      // Stop camera after capture
      stopCamera();
      
      console.log('📸 Photo captured, processing...');
      toast.info('Foto diambil, memproses QR code...');
      
      // Process the captured image
      processImage(canvas);
    } catch (error) {
      console.error('❌ Capture error:', error);
      toast.error('Gagal mengambil foto');
    }
  }, [isCameraActive, stopCamera]);

  // Process captured image to detect QR code
  const processImage = async (canvas: HTMLCanvasElement) => {
    setIsProcessing(true);
    setError(null);

    try {
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Try to detect QR code with multiple inversion attempts
      console.log('🔍 Attempting QR detection on captured image...');
      
      const detectionOptions = [
        { inversionAttempts: 'dontInvert' as const },
        { inversionAttempts: 'onlyInvert' as const },
        { inversionAttempts: 'attemptBoth' as const },
      ];

      let qrResult = null;
      for (const options of detectionOptions) {
        qrResult = jsQR(imageData.data, canvas.width, canvas.height, options);
        if (qrResult && qrResult.data) {
          console.log('🎯 QR Code detected with options:', options);
          break;
        }
      }

      if (qrResult && qrResult.data) {
        console.log('✅ QR Data found:', qrResult.data);
        
        const orderCode = parseOrderCode(qrResult.data);
        if (orderCode) {
          console.log('✅ Valid order code parsed:', orderCode);
          toast.success('QR Code berhasil terdeteksi!');
          fetchOrderData(orderCode);
        } else {
          throw new Error('QR code tidak mengandung kode order yang valid');
        }
      } else {
        throw new Error('Tidak dapat mendeteksi QR code pada gambar. Pastikan QR code terlihat jelas.');
      }
    } catch (error) {
      console.error('❌ Error processing image:', error);
      setError(error instanceof Error ? error.message : 'Error memproses gambar');
      setIsProcessing(false);
      toast.error(error instanceof Error ? error.message : 'Gagal membaca QR code dari gambar');
    }
  };

  // Fetch order data from API
  const fetchOrderData = async (orderCode: string) => {
    try {
      console.log('📡 Fetching order data for:', orderCode);
      const response = await fetch(`/api/admin/orders?search=${encodeURIComponent(orderCode)}`);
      
      if (!response.ok) {
        throw new Error('Order tidak ditemukan');
      }

      const data = await response.json();
      console.log('📦 Order data received:', data);

      if (data.orders && data.orders.length > 0) {
        const order = data.orders[0];
        setOrderData(order);
        setIsProcessing(false);
        toast.success(`Order ${order.orderCode} ditemukan!`);
      } else {
        throw new Error('Order tidak ditemukan');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Error mengambil data order');
      setIsProcessing(false);
      toast.error('Order tidak ditemukan');
    }
  };

  // Complete order
  const handleCompleteOrder = async () => {
    if (!orderData) return;

    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/orders/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderCode: orderData.orderCode }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyelesaikan order');
      }

      toast.success('Order berhasil diselesaikan!');
      router.push('/admin/orders');
    } catch (error) {
      console.error('❌ Error completing order:', error);
      toast.error('Gagal menyelesaikan order');
      setIsProcessing(false);
    }
  };

  // Reset scanner
  const handleReset = () => {
    setCapturedImage(null);
    setOrderData(null);
    setError(null);
    setIsProcessing(false);
    stopCamera();
  };

  // Start new scan
  const handleStartNewScan = () => {
    handleReset();
    startCamera();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Kembali ke Orders
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center">
              <QrCodeIcon className="w-10 h-10 mr-3 text-blue-600 dark:text-blue-400" />
              Scan QR Code Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Arahkan kamera ke QR code pembeli dan klik tombol capture
            </p>
          </motion.div>

          {/* Scanner Card */}
          {!orderData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8">
                {/* Camera View or Captured Image */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
                  {capturedImage ? (
                    // Show captured image
                    <>
                      <img
                        src={capturedImage}
                        alt="Captured QR"
                        className="w-full h-full object-contain"
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-center">
                            <LoadingSpinner />
                            <p className="text-white mt-4 font-medium">Memproses QR code...</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : isCameraActive ? (
                    // Show live camera feed
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Loading overlay while camera is initializing */}
                      {isCameraLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <div className="text-center">
                            <LoadingSpinner />
                            <p className="text-white mt-4 font-medium">Mengaktifkan kamera...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Scan overlay with frame - only show when camera is ready */}
                      {!isCameraLoading && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-64 h-64">
                              {/* Corner brackets */}
                              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500"></div>
                              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500"></div>
                              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500"></div>
                              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500"></div>
                              
                              {/* Center text */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                                  Posisikan QR code di sini
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status indicator */}
                          <div className="absolute top-4 left-4 bg-green-500 px-3 py-1 rounded-full flex items-center">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                            <span className="text-white text-sm font-medium">Live</span>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    // Show placeholder
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <VideoCameraIcon className="w-24 h-24 mb-4 text-gray-400" />
                      <p className="text-lg mb-2">Kamera belum aktif</p>
                      <p className="text-sm text-gray-400">Klik tombol di bawah untuk memulai</p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
                    >
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!isCameraActive && !capturedImage ? (
                    // Start camera button
                    <button
                      onClick={startCamera}
                      disabled={isCameraLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCameraLoading ? (
                        <>
                          <LoadingSpinner />
                          <span className="ml-2">Memulai...</span>
                        </>
                      ) : (
                        <>
                          <VideoCameraIcon className="w-6 h-6 mr-2" />
                          Aktifkan Kamera
                        </>
                      )}
                    </button>
                  ) : isCameraActive && !capturedImage ? (
                    // Camera active - show capture and cancel buttons
                    <>
                      <button
                        onClick={stopCamera}
                        disabled={isCameraLoading}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="w-6 h-6 mr-2" />
                        Batalkan
                      </button>
                      <button
                        onClick={capturePhoto}
                        disabled={isProcessing || isCameraLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white"></div>
                        </div>
                        <span className="ml-3 font-bold">AMBIL FOTO</span>
                      </button>
                    </>
                  ) : capturedImage && !isProcessing ? (
                    // Image captured - show retake button
                    <button
                      onClick={handleStartNewScan}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                    >
                      <CameraIcon className="w-6 h-6 mr-2" />
                      Foto Ulang
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details Card */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <CheckCircleIcon className="w-8 h-8 mr-3 text-green-600" />
                    Order Ditemukan
                  </h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    orderData.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : orderData.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {orderData.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kode Order</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{orderData.orderCode}</p>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pembeli</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{orderData.user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{orderData.user.email}</p>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      Rp {orderData.totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Item Pesanan</p>
                    <div className="space-y-2">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.variantName}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status Pembayaran</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                      orderData.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : orderData.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {orderData.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Scan Lagi
                  </button>
                  {orderData.status !== 'completed' && orderData.paymentStatus === 'paid' && (
                    <button
                      onClick={handleCompleteOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <LoadingSpinner />
                          <span className="ml-2">Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-6 h-6 mr-2" />
                          Selesaikan Order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Cara Menggunakan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Klik tombol &quot;Aktifkan Kamera&quot; untuk membuka live preview</li>
              <li>Arahkan kamera ke QR code order pembeli hingga terlihat jelas dalam frame</li>
              <li>Klik tombol lingkaran besar &quot;AMBIL FOTO&quot; untuk mengcapture gambar</li>
              <li>Sistem akan otomatis memproses QR code dari foto yang diambil</li>
              <li>Jika QR code valid, detail order akan ditampilkan</li>
              <li>Verifikasi detail order dan klik &quot;Selesaikan Order&quot; jika sudah sesuai</li>
            </ol>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tips:</strong> Pastikan QR code berada dalam frame dan pencahayaan cukup terang untuk hasil terbaik.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
