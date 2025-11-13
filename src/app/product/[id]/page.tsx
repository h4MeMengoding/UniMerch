'use client';

import { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Minus, 
  Plus,
  Share2,
  Award
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton';

interface VariantOption {
  id: number;
  name: string;
}

interface ProductVariant {
  id: number;
  name: string;
  options: VariantOption[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  isNew: boolean;
  isOnSale: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
}

const mockReviews = [
  {
    id: '1',
    user: 'Ahmad Rizki',
    rating: 5,
    date: '2025-01-15',
    comment: 'Kualitas produk sangat bagus! Bahan premium dan sesuai deskripsi. Recommended!',
    helpful: 12
  },
  {
    id: '2',
    user: 'Sari Dewi',
    rating: 4,
    date: '2025-01-10',
    comment: 'Ukuran sesuai size chart. Kualitas oke dan tidak mudah rusak.',
    helpful: 8
  },
  {
    id: '3',
    user: 'Budi Santoso',
    rating: 5,
    date: '2025-01-05',
    comment: 'Sebagai alumni kampus, ini wajib punya! Kualitas premium, packaging rapi. Top!',
    helpful: 15
  }
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
    const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Create multiple product images from single image with fallback
  const productImages = product && product.image ? [
    product.image,
    product.image,
    product.image,
    product.image
  ] : ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Produk tidak ditemukan');
        }

        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchProduct();
    }
  }, [resolvedParams.id]);

  // Initialize variant selections when product loads
  useEffect(() => {
    if (product && product.hasVariants && product.variants) {
      const colorVariant = product.variants.find(v => 
        v.name.toLowerCase().includes('color') || 
        v.name.toLowerCase().includes('warna') ||
        v.name.toLowerCase().includes('colour')
      );
      
      const sizeVariant = product.variants.find(v => 
        v.name.toLowerCase().includes('size') || 
        v.name.toLowerCase().includes('ukuran') ||
        v.name.toLowerCase().includes('sizing')
      );
      
      // Set default selections only if variants exist and no selection made yet
      if (colorVariant && colorVariant.options.length > 0 && !selectedColor) {
        setSelectedColor(colorVariant.options[0].name);
      }
      if (sizeVariant && sizeVariant.options.length > 0 && !selectedSize) {
        setSelectedSize(sizeVariant.options[0].name);
      }
    }
  }, [product, selectedColor, selectedSize]);

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: optionName
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBuyNow = async () => {
    // Check if user is logged in
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product || product.stock === 0) {
      alert('Produk tidak tersedia');
      return;
    }

    if (quantity > product.stock) {
      alert('Jumlah melebihi stok yang tersedia');
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Get selected variant options IDs
      const selectedVariantIds: number[] = [];
      
      if (product.hasVariants && product.variants) {
        product.variants.forEach(variant => {
          const selectedOption = selectedVariants[variant.name];
          if (selectedOption) {
            const option = variant.options.find(opt => opt.name === selectedOption);
            if (option) {
              selectedVariantIds.push(option.id);
            }
          }
        });
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          variantOptions: selectedVariantIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      // Redirect to payment
      if (data.paymentUrl) {
        // Redirect to payment page in the same tab
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL tidak tersedia');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat pesanan');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
          <Link href="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get real variants from database
  const productVariants = product && product.hasVariants && product.variants ? product.variants : [];
  
  // Get available colors and sizes from database
  const colorVariant = productVariants.find(v => 
    v.name.toLowerCase().includes('color') || 
    v.name.toLowerCase().includes('warna') ||
    v.name.toLowerCase().includes('colour')
  );
  
  const sizeVariant = productVariants.find(v => 
    v.name.toLowerCase().includes('size') || 
    v.name.toLowerCase().includes('ukuran') ||
    v.name.toLowerCase().includes('sizing')
  );
  
  const availableColors = colorVariant ? colorVariant.options.map(o => o.name) : [];
  const availableSizes = sizeVariant ? sizeVariant.options.map(o => o.name) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300 pt-16 md:pt-20 pb-20 md:pb-6">
      {/* Container with padding top for mobile */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-4 sm:pb-6">
        {/* Back Button & Breadcrumb - Side by side on mobile */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {/* Back Button - Mobile only */}
          <button
            onClick={() => router.back()}
            className="md:hidden flex-shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Home
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">›</span>
            <Link 
              href={`/category/${product.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} 
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {product.category}
            </Link>
          </nav>
        </div>

        {/* Back Button - Desktop only */}
        <div className="hidden md:block mb-3 sm:mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Product Info Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Product Images */}
          <div className="lg:col-span-1 xl:col-span-4 space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-100 dark:bg-dark-800 rounded-xl overflow-hidden">
              <Image
                src={productImages[selectedImage] || '/api/placeholder/400/400'}
                alt={product?.name || 'Product Image'}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/400/400';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    NEW
                  </span>
                )}
                {product.isOnSale && discountPercentage > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Share Button */}
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-800 transition-colors">
                <Share2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </button>
            </div>

            {/* Thumbnail Images - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-neutral-100 dark:bg-dark-800 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-600 dark:border-primary-400' : 'border-transparent hover:border-neutral-300 dark:hover:border-dark-600'
                  }`}
                >
                  <Image
                    src={image || '/api/placeholder/400/400'}
                    alt={`${product?.name || 'Product'} ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/400';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Center Column - Product Details */}
          <div className="lg:col-span-1 xl:col-span-5 space-y-4 sm:space-y-5">
            {/* Product Name */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Brand: UniMerch | SKU: UM-{product.id}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">4.5</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">(89 ulasan)</span>
              </div>
            </div>

            {/* Unit Price */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Harga Satuan:</h3>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-neutral-500 dark:text-neutral-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold px-2 py-1 rounded">
                        Hemat {discountPercentage}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Item Variants - Only show if product has variants */}
            {product.hasVariants && productVariants.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-medium text-neutral-900 dark:text-white">Pilihan Item:</h3>
                
                {/* Color Selection - Only show if color variant exists */}
                {colorVariant && availableColors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {colorVariant.name}: {selectedColor}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            selectedColor === color
                              ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                              : 'border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-dark-500'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection - Only show if size variant exists */}
                {sizeVariant && availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {sizeVariant.name}: {selectedSize}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                              : 'border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-dark-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Variants - Show any other variants dynamically */}
                {productVariants
                  .filter(v => v !== colorVariant && v !== sizeVariant)
                  .map((variant) => (
                    <div key={variant.id} className="space-y-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {variant.name}: {selectedVariants[variant.name] || variant.options[0]?.name || ''}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleVariantChange(variant.name, option.name)}
                            className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                              (selectedVariants[variant.name] || variant.options[0]?.name) === option.name
                                ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-dark-500'
                            }`}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Deskripsi dan Ulasan Tabs */}
            <div className="border-t border-neutral-200 dark:border-dark-700 pt-4 sm:pt-5">
              <div className="flex space-x-4 sm:space-x-6 mb-3 sm:mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'description'
                      ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Deskripsi
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Ulasan (89)
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === 'description' && (
                  <div className="space-y-3">
                    <div className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {product.description || 'Produk berkualitas tinggi dengan standar terbaik. Cocok untuk berbagai kebutuhan dan aktivitas sehari-hari.'}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1.5 text-sm sm:text-base">Fitur Utama:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                          <span>Kualitas Premium</span>
                        </li>
                        <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                          <span>Garansi Kualitas</span>
                        </li>
                        <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                          <span>Desain Eksklusif</span>
                        </li>
                        <li className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300 text-sm">
                          <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                          <span>Tahan Lama</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mockReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 dark:border-dark-700 pb-2 last:border-b-0">
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="font-medium text-neutral-900 dark:text-white text-sm">{review.user}</h5>
                            <div className="flex space-x-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-neutral-300 dark:text-neutral-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                      Lihat semua ulasan →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Controls */}
          <div className="hidden md:block lg:col-span-2 xl:col-span-3 bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl p-4 sm:p-5 h-fit sticky top-6">
            <div className="space-y-4 sm:space-y-5">
              {/* Section Title */}
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-dark-700 pb-2">
                Atur Pembelian
              </h3>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-dark-800 rounded-lg p-2.5">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {product.stock > 0 ? `Stok tersedia (${product.stock} item)` : 'Stok habis'}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Jumlah:
                </label>
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-neutral-300 dark:border-dark-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors rounded-l-lg disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg text-neutral-900 dark:text-white min-w-20 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors rounded-r-lg disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                  Maksimal {product.stock} item
                </p>
              </div>

              {/* Total Price */}
              <div className="space-y-2 bg-neutral-50 dark:bg-dark-800 rounded-lg p-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Harga satuan:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Jumlah:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{quantity} item</span>
                  </div>
                  <hr className="border-neutral-200 dark:border-dark-600" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-white">Total Harga:</span>
                    <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Add to Cart Button */}
                <button
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  disabled={product.stock === 0 || isProcessingOrder}
                >
                  {isProcessingOrder ? (
                    <span>Memproses...</span>
                  ) : product.stock > 0 ? (
                    <span>Beli Sekarang</span>
                  ) : (
                    <span>Stok Habis</span>
                  )}
                </button>

                {/* Like/Wishlist Button */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium border-2 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'border-neutral-300 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Disukai' : 'Sukai'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-900 border-t border-neutral-200 dark:border-dark-700 px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Quantity Selector - Compact */}
          <div className="flex items-center border border-neutral-300 dark:border-dark-600 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors rounded-l-lg disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
            <span className="px-3 py-2 font-semibold text-sm text-neutral-900 dark:text-white min-w-12 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors rounded-r-lg disabled:opacity-50"
              disabled={quantity >= product.stock}
            >
              <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Add to Cart Button - Icon Only */}
          <button
            className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-lg transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
            disabled={product.stock === 0}
            aria-label="Tambah ke Keranjang"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          {/* Buy Now Button - Full Width */}
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed text-sm"
            disabled={product.stock === 0 || isProcessingOrder}
          >
            {isProcessingOrder ? (
              'Proses...'
            ) : product.stock > 0 ? (
              'Beli Sekarang'
            ) : (
              'Stok Habis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}