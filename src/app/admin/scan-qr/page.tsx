'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// Simple SVG icons
const QrCodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// QR scan result interface
interface QRScanResult {
  orderCode: string;
  rawData: string;
}

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [scanCount, setScanCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const qrDetectedRef = useRef<boolean>(false);
  
  const router = useRouter();

  // Enhanced parser for multiple QR formats from PaymentSuccessContent
  const parseOrderCode = useCallback((data: string): string | null => {
    console.log('🔍 Parsing QR data:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
    
    try {
      // Try JSON format first (primary format from PaymentSuccessContent)
      const parsed = JSON.parse(data);
      console.log('✅ Successfully parsed JSON:', {
        hasOrderCode: !!parsed.orderCode,
        hasOrderId: !!parsed.orderId,
        hasUserId: !!parsed.userId,
        hasItems: !!parsed.items,
        hasTotalAmount: !!parsed.totalAmount,
        hasTimestamp: !!parsed.timestamp
      });
      
      // Primary: orderCode field (DD-MM-YY-NNNNN format)
      if (parsed.orderCode && typeof parsed.orderCode === 'string') {
        console.log('✅ Found orderCode in JSON:', parsed.orderCode);
        return parsed.orderCode;
      }
      
      // Secondary: orderId field (numeric or string)
      if (parsed.orderId) {
        console.log('✅ Found orderId in JSON:', parsed.orderId);
        return parsed.orderId.toString();
      }
      
      // Tertiary: userId field (for compatibility)
      if (parsed.userId) {
        console.log('⚠️ Using userId as fallback:', parsed.userId);
        return parsed.userId.toString();
      }
      
      console.log('❌ No recognized fields in JSON object');
      return null;
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
    
    // Check for specific pattern like 22102500045 (11 digits)
    const specificPattern = /^\d{11}$/;
    if (specificPattern.test(data.trim())) {
      console.log('✅ 11-digit code detected (like order ID):', data.trim());
      return data.trim();
    }
    
    // Check for order code pattern anywhere in the string
    const orderCodeMatch = data.match(/\d{2}-\d{2}-\d{2}-\d{5}/);
    if (orderCodeMatch) {
      console.log('✅ Order code pattern found in string:', orderCodeMatch[0]);
      return orderCodeMatch[0];
    }
    
    // Check for any sequence of 8+ digits (could be various ID formats)
    const longNumericMatch = data.match(/\d{8,}/);
    if (longNumericMatch) {
      console.log('✅ Long numeric sequence found:', longNumericMatch[0]);
      return longNumericMatch[0];
    }
    
    console.log('❌ No valid order format found in data');
    return null;
  }, []);

  // Clean up camera and scanning resources
  const cleanupCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (detectionLoopRef.current) {
      clearTimeout(detectionLoopRef.current);
      detectionLoopRef.current = null;
      console.log('🛑 Stopped detection loop');
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clean up canvas reference
    if (canvasRef.current) {
      try {
        // Clear canvas before removing reference
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } catch (canvasCleanupError) {
        console.warn('Canvas cleanup warning:', canvasCleanupError);
      }
      canvasRef.current = null;
      console.log('🧹 Canvas cleaned up');
    }
    
    console.log('✅ Camera cleanup completed');
  }, []);

  // Enhanced QR detection with multiple attempts and better timing
  const detectQRCode = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current || qrDetectedRef.current) {
      if (qrDetectedRef.current) {
        console.log('🛑 Detection stopped: QR already detected');
      } else {
        console.log('Detection stopped: scanning=' + isScanningRef.current + ', video=' + !!videoRef.current);
      }
      return;
    }

    const video = videoRef.current;
    
    // Always increment scan count to show activity
    setScanCount(prev => {
      const newCount = prev + 1;
      if (newCount % 100 === 0) {
        console.log('🔍 Scan attempts:', newCount);
      }
      return newCount;
    });
    
    // Check if video is playing and has data
    if (video.readyState < 2) {
      if (scanCount % 50 === 0) {
        console.log('Video not ready, readyState:', video.readyState);
      }
      setDebugInfo(`Video loading... readyState: ${video.readyState}`);
      return; // Let the main loop handle retry
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      if (scanCount % 50 === 0) {
        console.log('Video dimensions not ready:', video.videoWidth, 'x', video.videoHeight);
      }
      setDebugInfo(`Video sizing... ${video.videoWidth}x${video.videoHeight}`);
      return; // Let the main loop handle retry
    }

    // Create or get canvas with proper setup
    if (!canvasRef.current) {
      try {
        canvasRef.current = document.createElement('canvas');
        console.log('✅ Created new canvas element');
      } catch (canvasError) {
        console.error('❌ Failed to create canvas element:', canvasError);
        setDebugInfo(`Canvas creation error: ${canvasError}`);
        return;
      }
    }
    
    const canvas = canvasRef.current;
    
    // Validate canvas exists and is valid
    if (!canvas || typeof canvas.getContext !== 'function') {
      console.error('❌ Canvas element is invalid:', canvas);
      setDebugInfo('Canvas element validation failed');
      return;
    }
    
    const context = canvas.getContext('2d', { 
      willReadFrequently: true // Optimize for frequent getImageData calls
    });
    
    if (!context) {
      console.error('❌ Failed to get 2D context from canvas');
      setDebugInfo('Canvas 2D context failed');
      return; // Let the main loop handle retry
    }

    // Set canvas dimensions to match video with validation
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Validate that dimensions were set correctly
      if (!canvas.width || !canvas.height || canvas.width === 0 || canvas.height === 0 || 
          typeof canvas.width !== 'number' || typeof canvas.height !== 'number') {
        console.error('❌ Invalid canvas dimensions after setting:', {
          width: canvas.width,
          height: canvas.height,
          widthType: typeof canvas.width,
          heightType: typeof canvas.height,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
        setDebugInfo(`Canvas setup error: ${canvas.width}x${canvas.height} (video: ${video.videoWidth}x${video.videoHeight})`);
        return; // Let the main loop handle retry
      }
    } catch (dimensionError) {
      console.error('❌ Error setting canvas dimensions:', dimensionError);
      setDebugInfo(`Canvas dimension error: ${dimensionError}`);
      return;
    }

    // Only log canvas setup occasionally to reduce console spam
    if (scanCount % 50 === 0) {
      console.log(`🎨 Canvas: ${canvas.width}x${canvas.height}, video: ${video.videoWidth}x${video.videoHeight}`);
    }

    try {
      // Clear canvas first
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Debug: Check if image data looks valid
      if (imageData.data.length === 0) {
        console.error('❌ Empty image data!');
        return;
      }
      
      // Sample some pixel data to ensure it's not all black/empty (only log occasionally)
      if (scanCount % 100 === 0) {
        const samplePixels = imageData.data.slice(0, 100);
        const hasVariation = samplePixels.some((value, index) => index % 4 < 3 && value > 10);
        console.log('📊 Image variation check:', hasVariation, 'Scans:', scanCount);
      }
      
      // Double-check canvas validity before QR detection attempts
      if (!canvas || !canvas.width || !canvas.height) {
        console.error('❌ Canvas validation failed before QR detection:', {
          canvas: !!canvas,
          width: canvas?.width,
          height: canvas?.height
        });
        setDebugInfo(`Canvas invalid before detection: ${canvas?.width}x${canvas?.height}`);
        return;
      }

      // Try multiple QR detection approaches
      const detectionOptions = [
        { inversionAttempts: 'dontInvert' as const },
        { inversionAttempts: 'onlyInvert' as const },
        { inversionAttempts: 'attemptBoth' as const },
        { inversionAttempts: 'attemptBoth' as const, greyScaleWeights: { red: 77, green: 150, blue: 29, useIntegerApproximation: true } }
      ];
      
      let detectionAttempts = 0;
      for (const options of detectionOptions) {
        detectionAttempts++;
        try {
          // Final validation before each jsQR call
          if (!canvas || typeof canvas.width !== 'number' || typeof canvas.height !== 'number' || canvas.width <= 0 || canvas.height <= 0) {
            console.error('❌ Canvas became invalid during detection loop:', {
              canvas: !!canvas,
              width: canvas?.width,
              height: canvas?.height,
              widthType: typeof canvas?.width,
              heightType: typeof canvas?.height
            });
            break; // Exit the detection loop
          }

          // Only log detailed attempts occasionally to reduce spam
          if (scanCount % 20 === 0) {
            console.log(`🔍 Detection attempt ${detectionAttempts}/4, scan #${scanCount}, canvas: ${canvas.width}x${canvas.height}`);
          }
          
          // Safe jsQR call with additional validation
          let qrResult = null;
          try {
            if (imageData && imageData.data && imageData.data.length > 0 && 
                typeof canvas.width === 'number' && typeof canvas.height === 'number' &&
                canvas.width > 0 && canvas.height > 0) {
              qrResult = jsQR(imageData.data, canvas.width, canvas.height, options);
            } else {
              console.error('❌ Invalid parameters for jsQR:', {
                imageDataExists: !!imageData,
                imageDataLength: imageData?.data?.length,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                canvasWidthType: typeof canvas.width,
                canvasHeightType: typeof canvas.height
              });
              continue; // Skip this detection attempt
            }
          } catch (jsQRError) {
            console.error('❌ jsQR threw error:', jsQRError);
            continue; // Skip this detection attempt
          }
          
          if (qrResult && qrResult.data) {
            console.log('🎯 QR Code detected!');
            console.log('📱 QR Data:', qrResult.data);
            console.log('📍 QR Location:', qrResult.location);
            console.log('🔧 Detection options used:', options);
            
            setDebugInfo(`QR found: "${qrResult.data}"`);
            
            // Set QR detected flag to prevent further scanning
            qrDetectedRef.current = true;
            
            // For testing, let's also try manual parsing for "22102500045"
            if (qrResult.data === '22102500045' || qrResult.data.includes('22102500045')) {
              console.log('🎉 FOUND THE SPECIFIC QR: 22102500045');
              setScanResult({ orderCode: '22102500045', rawData: qrResult.data });
              setIsScanning(false);
              isScanningRef.current = false;
              cleanupCamera();
              toast.success('QR Code successfully scanned: 22102500045');
              return;
            }
            
            const orderCode = parseOrderCode(qrResult.data);
            if (orderCode) {
              console.log('✅ Valid order code parsed:', orderCode);
              setScanResult({ orderCode, rawData: qrResult.data });
              setIsScanning(false);
              isScanningRef.current = false;
              cleanupCamera();
              toast.success('QR Code successfully scanned!');
              return; // Stop scanning
            } else {
              // Reset flag if QR was detected but not valid
              qrDetectedRef.current = false;
              console.log('❌ Parser rejected QR data, but we detected it. Raw data:', qrResult.data);
              setDebugInfo(`Detected but invalid: "${qrResult.data}"`);
              // Continue to next detection attempt
            }
          } else {
            console.log(`❌ Detection attempt ${detectionAttempts} failed - no QR found`);
          }
        } catch (detectionError) {
          console.error(`❌ Detection attempt ${detectionAttempts} threw error:`, detectionError);
        }
      }
      
      // Log detection failure less frequently to reduce console spam
      if (scanCount % 20 === 0) {
        console.log(`📊 All ${detectionAttempts} detection attempts completed, no QR found at scan ${scanCount}`);
      }
      
      // Update debug info with current scanning status  
      setDebugInfo(`Scanning... Frame: ${canvas.width}x${canvas.height} | Scans: ${scanCount}`);
      
    } catch (error) {
      console.error('Frame processing error:', error);
      setDebugInfo(`Frame error: ${error}`);
    }

    // Detection will continue via the continuous loop in startScanning
    // No need to schedule next detection here as it's handled by the main loop
  }, [parseOrderCode, cleanupCamera, scanCount]);

  // Simplified and more reliable camera startup
  const startScanning = useCallback(async () => {
    console.log('🎥 Starting camera scanning process...');
    setError(null);
    setScanCount(0);
    setDebugInfo('Requesting camera access...');

    try {
      // Clean up any existing resources first
      cleanupCamera();

      // Set scanning state immediately so video element appears
      setIsScanning(true);
      isScanningRef.current = true;
      qrDetectedRef.current = false; // Reset QR detection flag

      // Wait for React to re-render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      console.log('📹 Attempting to get user media...');
      
      // Simple camera request - try multiple approaches
      let stream: MediaStream | null = null;
      
      // Try approach 1: Environment facing (back camera)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: 1280,
            height: 720
          }
        });
        console.log('✅ Got stream with environment camera');
      } catch (err) {
        console.log('❌ Environment camera failed, trying default:', err);
        
        // Try approach 2: Any camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 }
          });
          console.log('✅ Got stream with default camera');
        } catch (err2) {
          console.log('❌ Default camera failed, trying basic:', err2);
          
          // Try approach 3: Most basic request
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log('✅ Got stream with basic video request');
        }
      }

      if (!stream) {
        throw new Error('Failed to get camera stream');
      }

      streamRef.current = stream;
      setCameraPermission('granted');
      console.log('✅ Camera stream obtained');

      // Check if video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found - check if isScanning state updated correctly');
      }

      const video = videoRef.current;
      console.log('📺 Setting up video element...');
      
      // Setup video
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      // Wait for video to load and play
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Video load timeout after 10 seconds'));
        }, 10000);

        const onCanPlay = () => {
          console.log('✅ Video can play');
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          resolve();
        };

        const onError = (e: Event) => {
          console.error('❌ Video error:', e);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          reject(new Error('Video failed to load'));
        };

        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onError);

          // Force play with user gesture context
        video.play().then(() => {
          console.log('✅ Video play() succeeded');
        }).catch(playErr => {
          console.warn('⚠️ Initial play failed (likely autoplay policy):', playErr);
          // The canplay event should still fire, video will be ready
        });
      });

      console.log('✅ Video is ready, dimensions:', video.videoWidth + 'x' + video.videoHeight);
      setDebugInfo(`Video ready: ${video.videoWidth}x${video.videoHeight}`);

      // Start continuous detection loop
      setTimeout(() => {
        console.log('🎯 Starting continuous QR detection loop...');
        setDebugInfo('Starting continuous QR detection...');
        
        // Start the detection loop immediately and continuously
        const startContinuousDetection = () => {
          // Double check if still scanning using refs to avoid stale closure
          if (!isScanningRef.current || !videoRef.current || !streamRef.current || qrDetectedRef.current) {
            console.log('🛑 Detection loop stopped - conditions not met:', {
              scanning: isScanningRef.current,
              video: !!videoRef.current,
              stream: !!streamRef.current,
              qrDetected: qrDetectedRef.current
            });
            return;
          }
          
          try {
            detectQRCode();
          } catch (error) {
            console.error('Detection error in loop:', error);
          }
          
          // Schedule next detection with faster interval for better responsiveness
          detectionLoopRef.current = setTimeout(startContinuousDetection, 50);
        };
        
        startContinuousDetection();
      }, 1000);

    } catch (error) {
      console.error('❌ Camera startup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown camera error';
      setError(`Camera error: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
      setCameraPermission('denied');
      setIsScanning(false);
      isScanningRef.current = false;
      qrDetectedRef.current = false;
    }
  }, [cleanupCamera, detectQRCode]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    console.log('🛑 Stopping scan...');
    setIsScanning(false);
    isScanningRef.current = false;
    qrDetectedRef.current = false;
    setDebugInfo('Stopping scan...');
    cleanupCamera();
  }, [cleanupCamera]);

  // Process the scanned order
  const processOrder = async (orderCode: string) => {
    if (isProcessing) return;
    
    console.log('🔄 Processing order:', orderCode);
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/orders/by-code?code=${encodeURIComponent(orderCode)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const orderData: OrderData = await response.json();
      console.log('✅ Order found:', orderData);
      
      toast.success(`Order found: ${orderData.orderCode}`);
      
      // Navigate to order details or show order info
      router.push(`/admin/orders?search=${orderCode}`);
    } catch (error) {
      console.error('❌ Error processing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset scan result
  const resetScan = () => {
    setScanResult(null);
    setError(null);
    setScanCount(0);
    setDebugInfo('');
    isScanningRef.current = false;
    qrDetectedRef.current = false;
  };

  // Test function using actual PaymentSuccessContent format
  const testQRScanner = () => {
    console.log('🧪 Testing QR Scanner with real payment success format...');
    
    // Create test data using EXACT format from PaymentSuccessContent
    const currentDate = new Date();
    const testOrderCode = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().slice(-2)}-19004`;
    
    const testQRData = {
      orderId: 31,
      orderCode: testOrderCode,
      userId: 1,
      items: [
        {
          productName: "Test Product",
          quantity: 2,
          price: 15000
        }
      ],
      totalAmount: 30000,
      timestamp: new Date().toISOString()
    };

    // Test different formats that might be encountered
    const testFormats = [
      // 1. Full PaymentSuccessContent format (primary)
      JSON.stringify(testQRData),
      // 2. Simplified JSON with just orderCode
      JSON.stringify({ orderCode: testOrderCode }),
      // 3. Direct order code string
      testOrderCode,
      // 4. Numeric order ID
      '31'
    ];

    console.log('🔬 Testing parser with multiple formats:');
    let successCount = 0;
    const testResults: string[] = [];
    
    testFormats.forEach((testData, index) => {
      const orderCode = parseOrderCode(testData);
      const formatName = ['PaymentSuccess JSON', 'Simple JSON', 'Direct String', 'Numeric ID'][index];
      const result = `${formatName}: ${orderCode ? '✅ SUCCESS' : '❌ FAILED'} -> "${orderCode}"`;
      testResults.push(result);
      console.log(`Test ${index + 1} (${formatName}):`, orderCode ? '✅' : '❌', orderCode);
      if (orderCode) successCount++;
    });

    // Use PaymentSuccessContent format for demo
    const primaryTestData = testFormats[0];
    const orderCode = parseOrderCode(primaryTestData);
    
    if (orderCode) {
      setScanResult({ orderCode, rawData: primaryTestData });
      setScanCount(1);
      setDebugInfo(`Parser test: ${successCount}/${testFormats.length} formats working. Using: ${testOrderCode}`);
      toast.success(`🎉 Parser working! ${successCount}/${testFormats.length} formats supported`);
      
      console.log('📊 Test Results Summary:');
      testResults.forEach(result => console.log('  ', result));
    } else {
      setDebugInfo('❌ All parser tests failed');
      toast.error('Parser test failed - no formats working');
    }
  };

  // Force camera test
  const testCameraAccess = async () => {
    try {
      setDebugInfo('Testing camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tracks = stream.getTracks();
      console.log('Camera test successful, tracks:', tracks.length);
      tracks.forEach(track => track.stop());
      setDebugInfo('Camera test: SUCCESS - Camera is accessible');
      toast.success('Camera access test successful');
    } catch (error) {
      console.error('Camera test failed:', error);
      setDebugInfo(`Camera test: FAILED - ${error}`);
      toast.error('Camera access test failed');
    }
  };

  // Test live QR generation like PaymentSuccessContent does
  const testLiveQRGeneration = async () => {
    try {
      setDebugInfo('Generating test QR code like PaymentSuccessContent...');
      
      // Import QRCode library dynamically to test
      const QRCode = (await import('qrcode')).default;
      
      const currentDate = new Date();
      const testOrderCode = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().slice(-2)}-19004`;
      
      // Create QR data exactly like PaymentSuccessContent
      const qrData = {
        orderId: 31,
        orderCode: testOrderCode,
        userId: 1,
        items: [{
          productName: "Test Live Product",
          quantity: 1,
          price: 25000
        }],
        totalAmount: 25000,
        timestamp: new Date().toISOString()
      };

      const qrString = JSON.stringify(qrData);
      
      // Generate QR code
      const qrCodeURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Test if our parser can handle this generated QR data
      const parsedOrderCode = parseOrderCode(qrString);
      
      console.log('🎯 Live QR Generation Test:');
      console.log('Generated QR data:', qrString.substring(0, 200) + '...');
      console.log('Generated QR URL length:', qrCodeURL.length);
      console.log('Parser result:', parsedOrderCode);
      
      if (parsedOrderCode) {
        setDebugInfo(`Live QR test: SUCCESS - Generated and parsed "${parsedOrderCode}"`);
        toast.success(`🎉 Live QR generation test successful! Generated: ${testOrderCode}`);
        
        // Show in scan result for verification
        setScanResult({ orderCode: parsedOrderCode, rawData: qrString });
        setScanCount(1);
      } else {
        setDebugInfo('Live QR test: FAILED - Generated QR but parser failed');
        toast.error('Live QR test failed - parser could not read generated QR');
      }
    } catch (error) {
      console.error('Live QR generation test failed:', error);
      setDebugInfo(`Live QR test: ERROR - ${error}`);
      toast.error('Live QR generation test failed');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  // Sync isScanning state with ref
  useEffect(() => {
    isScanningRef.current = isScanning;
    console.log('🔄 Scanning state updated:', isScanning, 'ref:', isScanningRef.current);
  }, [isScanning]);

  // Check camera permission on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then((result) => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        })
        .catch(() => {
          setCameraPermission('prompt');
        });
    }
  }, []);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <QrCodeIcon className="h-16 w-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Scanner
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Scan customer QR codes to process orders
            </p>
          </div>

          {/* Debug Info Panel */}
          <div className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Debug Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Camera Permission:</strong> {cameraPermission}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Scanning:</strong> {isScanning ? 'Active' : 'Inactive'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Scan Count:</strong> {scanCount}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Video Element:</strong> {videoRef.current ? 'Ready' : 'Not Ready'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Stream:</strong> {streamRef.current ? 'Active' : 'None'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Canvas:</strong> {canvasRef.current ? 'Ready' : 'Not Created'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Video Size:</strong> {videoRef.current ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 'N/A'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Ready State:</strong> {videoRef.current ? videoRef.current.readyState : 'N/A'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>jsQR:</strong> {typeof jsQR === 'function' ? 'Loaded' : 'Not Available'}
                </p>
              </div>
            </div>

            {debugInfo && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded">
                <p className="text-blue-800 dark:text-blue-200 text-xs font-mono">
                  {debugInfo}
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
            >
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {!scanResult ? (
              <div className="p-6">
                {/* Camera View */}
                {isScanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg bg-black"
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        console.log('📺 Video onLoadedMetadata fired');
                        if (videoRef.current) {
                          console.log('Video dimensions:', videoRef.current.videoWidth + 'x' + videoRef.current.videoHeight);
                        }
                      }}
                      onCanPlay={() => {
                        console.log('▶️ Video onCanPlay fired');
                      }}
                      onPlay={() => {
                        console.log('🎬 Video onPlay fired');
                      }}
                      onError={(e) => {
                        console.error('❌ Video onError fired:', e);
                      }}
                    />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 flex items-center justify-center animate-pulse">
                        <p className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          🔍 Scanning continuously...
                        </p>
                      </div>
                    </div>
                    
                    {/* Scan indicator */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        Detecting: {scanCount}
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {
                          console.log('🔧 Force detection triggered manually');
                          detectQRCode();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                        title="Force Detection"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={stopScanning}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                        title="Stop Scanning"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCodeIcon className="h-24 w-24 mx-auto text-gray-400 mb-6" />
                    
                    {cameraPermission === 'denied' ? (
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Camera access is required to scan QR codes.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Please enable camera permissions in your browser settings.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Click the button below to start scanning QR codes
                      </p>
                    )}

                    <div className="flex justify-center gap-2 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          console.log('👆 Start Scanning button clicked');
                          console.log('Current states:', { isScanning, cameraPermission });
                          startScanning();
                        }}
                        disabled={cameraPermission === 'denied' || isScanning}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <QrCodeIcon className="h-5 w-5" />
                        {isScanning ? 'Starting...' : 'Start Scanning'}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={testQRScanner}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Test Parser
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={testCameraAccess}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Test Camera
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={testLiveQRGeneration}
                        className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Test Live QR
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          console.log('🧪 Testing specific QR: 22102500045');
                          const orderCode = parseOrderCode('22102500045');
                          if (orderCode) {
                            setScanResult({ orderCode: '22102500045', rawData: '22102500045' });
                            setScanCount(1);
                            setDebugInfo('Manual test: 22102500045 detected');
                            toast.success('Manual test successful: 22102500045');
                          } else {
                            setDebugInfo('Manual test failed: Parser rejected 22102500045');
                            toast.error('Parser cannot handle 22102500045');
                          }
                        }}
                        className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs"
                      >
                        Test 22102500045
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Scan Result */
              <div className="p-6">
                <div className="text-center mb-6">
                  <CheckCircleIcon className="h-16 w-16 mx-auto text-green-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    QR Code Detected!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Order Code: <span className="font-mono font-bold">{scanResult.orderCode}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => processOrder(scanResult.orderCode)}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Process Order
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetScan}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Scan Another
                  </motion.button>
                </div>

                {/* Raw Data Display */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Show raw QR data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-auto">
                    {scanResult.rawData}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to use:
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Click "Start Scanning" to activate the camera</li>
              <li>• Position the customer's QR code within the scanning area</li>
              <li>• The scanner will automatically detect and process valid QR codes</li>
              <li>• Use "Test Scanner" to verify the functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}