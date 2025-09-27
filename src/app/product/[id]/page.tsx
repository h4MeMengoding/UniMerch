'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  Minus, 
  Plus,
  Share2,
  MessageCircle,
  Award
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data untuk produk merchandise (same as in page.tsx)
const mockProducts = [
  // Totebag
  {
    id: 'tb-a',
    name: 'Totebag Canvas – Desain A',
    description: 'Totebag canvas 12oz muat A4, sablon plastisol, tali kuat untuk aktivitas kampus.',
    price: 69000,
    originalPrice: 89000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.7,
    reviewCount: 128,
    category: 'Tas & Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-TB-A',
    stock: 24,
    isNew: true,
    isOnSale: true,
    features: [
      'Bahan Canvas 12oz Premium',
      'Sablon Plastisol Tahan Lama',
      'Tali Kuat dan Nyaman',
      'Muat Dokumen A4',
      'Desain Minimalis',
      'Cocok untuk Aktivitas Kampus'
    ],
    specifications: {
      'Bahan': 'Canvas 12oz',
      'Dimensi': '35 x 40 cm',
      'Perawatan': 'Hand Wash',
      'Asal': 'Indonesia',
      'Ketebalan': 'Medium Weight'
    },
    colors: ['Natural', 'Navy', 'Black'],
    sizes: ['One Size']
  },
  {
    id: 'tb-b',
    name: 'Totebag Canvas – Desain B',
    description: 'Bahan canvas 12oz dengan saku dalam, cocok untuk buku A4 dan laptop tipis.',
    price: 79000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.5,
    reviewCount: 76,
    category: 'Tas & Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-TB-B',
    stock: 18,
    isNew: false,
    isOnSale: false,
    features: [
      'Bahan Canvas 12oz Premium',
      'Saku Dalam untuk Keamanan',
      'Muat Laptop hingga 13 inch',
      'Jahitan Kuat dan Rapi',
      'Desain Fungsional',
      'Cocok untuk Kuliah'
    ],
    specifications: {
      'Bahan': 'Canvas 12oz',
      'Dimensi': '38 x 42 cm',
      'Perawatan': 'Hand Wash',
      'Asal': 'Indonesia',
      'Ketebalan': 'Medium Weight'
    },
    colors: ['Khaki', 'Navy', 'Black'],
    sizes: ['One Size']
  },
  {
    id: 'tb-c',
    name: 'Totebag Premium – Desain C',
    description: 'Canvas premium 14oz, jahitan bartack di pegangan, kapasitas besar.',
    price: 99000,
    originalPrice: 119000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.6,
    reviewCount: 92,
    category: 'Tas & Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-TB-C',
    stock: 15,
    isNew: false,
    isOnSale: true,
    features: [
      'Bahan Canvas Premium 14oz',
      'Jahitan Bartack Extra Kuat',
      'Kapasitas Besar',
      'Handle yang Nyaman',
      'Desain Premium',
      'Tahan Lama'
    ],
    specifications: {
      'Bahan': 'Canvas 14oz Premium',
      'Dimensi': '40 x 45 cm',
      'Perawatan': 'Hand Wash',
      'Asal': 'Indonesia',
      'Ketebalan': 'Heavy Weight'
    },
    colors: ['Natural', 'Black', 'Navy'],
    sizes: ['One Size']
  },

  // Bucket Hat
  {
    id: 'bh-a',
    name: 'Bucket Hat – Desain A',
    description: 'Katun drill adem, bordir logo kampus di depan, rim medium.',
    price: 89000,
    originalPrice: 109000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.6,
    reviewCount: 54,
    category: 'Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-BH-A',
    stock: 20,
    isNew: false,
    isOnSale: true,
    features: [
      'Bahan Katun Drill Adem',
      'Bordir Logo Kampus',
      'Rim Medium',
      'Nyaman Dipakai',
      'UV Protection',
      'Cocok untuk Outdoor'
    ],
    specifications: {
      'Bahan': 'Cotton Drill',
      'Lingkar Kepala': '56-58 cm',
      'Perawatan': 'Hand Wash',
      'Asal': 'Indonesia',
      'UV Protection': 'UPF 30+'
    },
    colors: ['Khaki', 'Black', 'Navy'],
    sizes: ['S/M', 'L/XL']
  },
  {
    id: 'bh-b',
    name: 'Bucket Hat – Desain B (Hitam)',
    description: 'Bahan katun, bordir rapi, cocok untuk outdoor & casual.',
    price: 99000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.4,
    reviewCount: 38,
    category: 'Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-BH-B',
    stock: 12,
    isNew: true,
    isOnSale: false,
    features: [
      'Bahan Katun Premium',
      'Bordir Rapi dan Presisi',
      'Warna Hitam Elegan',
      'Multifungsi',
      'Tahan Cuaca',
      'Style Kasual'
    ],
    specifications: {
      'Bahan': 'Cotton Premium',
      'Lingkar Kepala': '56-60 cm',
      'Perawatan': 'Hand Wash',
      'Asal': 'Indonesia',
      'Warna': 'Black'
    },
    colors: ['Black'],
    sizes: ['One Size']
  },
  {
    id: 'bh-c',
    name: 'Bucket Hat – Desain C (Navy)',
    description: 'Versi navy minimalis, ringan dan nyaman dipakai harian.',
    price: 109000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.5,
    reviewCount: 41,
    category: 'Aksesoris',
    brand: 'UniMerch',
    sku: 'UM-BH-C',
    stock: 8,
    isNew: true,
    isOnSale: false,
    features: [
      'Desain Minimalis',
      'Warna Navy Klasik',
      'Bahan Ringan',
      'Nyaman untuk Harian',
      'Versatile Style',
      'Premium Quality'
    ],
    specifications: {
      'Bahan': 'Cotton Blend',
      'Lingkar Kepala': '56-58 cm',
      'Perawatan': 'Machine Wash',
      'Asal': 'Indonesia',
      'Warna': 'Navy'
    },
    colors: ['Navy'],
    sizes: ['One Size']
  },

  // Kaos
  {
    id: 'tee-a',
    name: 'Kaos – Desain A (Combed 24s)',
    description: 'Kaos unisex cotton combed 24s, sablon plastisol, cutting regular.',
    price: 119000,
    originalPrice: 149000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.8,
    reviewCount: 210,
    category: 'Pakaian',
    brand: 'UniMerch',
    sku: 'UM-TEE-A',
    stock: 30,
    isNew: true,
    isOnSale: true,
    features: [
      'Bahan Cotton Combed 24s',
      'Sablon Plastisol Awet',
      'Cutting Regular Fit',
      'Unisex Design',
      'Nyaman Dipakai',
      'Kualitas Premium'
    ],
    specifications: {
      'Bahan': 'Cotton Combed 24s',
      'Gramasi': '180gsm',
      'Perawatan': 'Machine Wash 30°C',
      'Asal': 'Indonesia',
      'Fit': 'Regular'
    },
    colors: ['White', 'Black', 'Navy', 'Grey'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'tee-b',
    name: 'Kaos – Desain B (Oversize 24s)',
    description: 'Bahan combed 24s, fit oversize, printing awet tidak mudah pecah.',
    price: 129000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.7,
    reviewCount: 143,
    category: 'Pakaian',
    brand: 'UniMerch',
    sku: 'UM-TEE-B',
    stock: 25,
    isNew: false,
    isOnSale: false,
    features: [
      'Bahan Cotton Combed 24s',
      'Fit Oversize Trendy',
      'Printing Berkualitas Tinggi',
      'Tidak Mudah Pecah',
      'Comfortable Wear',
      'Modern Style'
    ],
    specifications: {
      'Bahan': 'Cotton Combed 24s',
      'Gramasi': '180gsm',
      'Perawatan': 'Machine Wash 30°C',
      'Asal': 'Indonesia',
      'Fit': 'Oversize'
    },
    colors: ['White', 'Black', 'Khaki', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'tee-c',
    name: 'Kaos – Desain C (Combed 30s)',
    description: 'Lebih ringan dan adem, cocok untuk aktivitas harian.',
    price: 99000,
    originalPrice: 129000,
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    rating: 4.6,
    reviewCount: 98,
    category: 'Pakaian',
    brand: 'UniMerch',
    sku: 'UM-TEE-C',
    stock: 22,
    isNew: false,
    isOnSale: true,
    features: [
      'Bahan Cotton Combed 30s',
      'Lebih Ringan dan Adem',
      'Cocok Aktivitas Harian',
      'Breathable Fabric',
      'Soft Touch',
      'Everyday Comfort'
    ],
    specifications: {
      'Bahan': 'Cotton Combed 30s',
      'Gramasi': '160gsm',
      'Perawatan': 'Machine Wash 30°C',
      'Asal': 'Indonesia',
      'Fit': 'Regular'
    },
    colors: ['White', 'Light Grey', 'Navy', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }
];

// Function to get product by ID
const getProductById = (id: string) => {
  return mockProducts.find(product => product.id === id) || mockProducts[0];
};

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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const mockProduct = getProductById(params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(mockProduct.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = mockProduct.originalPrice 
    ? Math.round(((mockProduct.originalPrice - mockProduct.price) / mockProduct.originalPrice) * 100)
    : 0;

  const tabs = [
    { id: 'description', label: 'Deskripsi' },
    { id: 'reviews', label: `Ulasan (${mockProduct.reviewCount})` }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-dark-700">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary-600 transition-colors">
              Toko
            </Link>
            <span>/</span>
            <Link href={`/category/${mockProduct.category.toLowerCase()}`} className="hover:text-primary-600 transition-colors">
              {mockProduct.category}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-medium">{mockProduct.name}</span>
          </motion.nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-5"
        >
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Produk</span>
          </Link>
        </motion.div>

        {/* Product Info Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6">
          {/* Left Column - Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 xl:col-span-4 space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-100 dark:bg-dark-800 rounded-xl overflow-hidden">
              <Image
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.name}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {mockProduct.isNew && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    NEW
                  </span>
                )}
                {mockProduct.isOnSale && discountPercentage > 0 && (
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

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-neutral-100 dark:bg-dark-800 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-600 dark:border-primary-400' : 'border-transparent hover:border-neutral-300 dark:hover:border-dark-600'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${mockProduct.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Center Column - Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 xl:col-span-5 space-y-6"
          >
            {/* Product Name */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                {mockProduct.name}
              </h1>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Brand: {mockProduct.brand} | SKU: {mockProduct.sku}
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
                        i < Math.floor(mockProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{mockProduct.rating}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">({mockProduct.reviewCount} ulasan)</span>
              </div>
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Harga Satuan:</h3>
              <div className="flex items-center space-x-3">
                <span className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(mockProduct.price)}
                </span>
                {mockProduct.originalPrice && mockProduct.originalPrice > mockProduct.price && (
                  <>
                    <span className="text-lg text-neutral-500 dark:text-neutral-400 line-through">
                      {formatPrice(mockProduct.originalPrice)}
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

            {/* Item Variants */}
            <div className="space-y-3">
              <h3 className="font-medium text-neutral-900 dark:text-white">Pilihan Item:</h3>
              
              {/* Color Selection */}
              <div className="space-y-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Warna: {selectedColor}</span>
                <div className="flex space-x-2">
                  {mockProduct.colors.map((color) => (
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

              {/* Size Selection */}
              <div className="space-y-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Ukuran: {selectedSize}</span>
                <div className="flex space-x-2">
                  {mockProduct.sizes.map((size) => (
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
            </div>

            {/* Deskripsi dan Ulasan Tabs */}
            <div className="border-t border-neutral-200 dark:border-dark-700 pt-6">
              <div className="flex space-x-6 mb-4">
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
                  Ulasan ({mockProduct.reviewCount})
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'description' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{mockProduct.description}</p>
                    
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Fitur Utama:</h4>
                      <ul className="space-y-1">
                        {mockProduct.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300 text-sm">
                            <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {mockReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 dark:border-dark-700 pb-3 last:border-b-0">
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
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Purchase Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl p-6 h-fit sticky top-6"
          >
            <div className="space-y-6">
              {/* Section Title */}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-dark-700 pb-3">
                Atur Pembelian
              </h3>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-dark-800 rounded-lg p-3">
                <div className={`w-3 h-3 rounded-full ${mockProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${mockProduct.stock > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {mockProduct.stock > 0 ? `Stok tersedia (${mockProduct.stock} item)` : 'Stok habis'}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="space-y-3">
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
                      onClick={() => setQuantity(Math.min(mockProduct.stock, quantity + 1))}
                      className="p-3 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors rounded-r-lg disabled:opacity-50"
                      disabled={quantity >= mockProduct.stock}
                    >
                      <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                  Maksimal {mockProduct.stock} item
                </p>
              </div>

              {/* Total Price */}
              <div className="space-y-3 bg-neutral-50 dark:bg-dark-800 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Harga satuan:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(mockProduct.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Jumlah:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{quantity} item</span>
                  </div>
                  <hr className="border-neutral-200 dark:border-dark-600" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-white">Total Harga:</span>
                    <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                      {formatPrice(mockProduct.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart Button */}
                <motion.button
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
                  whileHover={{ scale: mockProduct.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: mockProduct.stock > 0 ? 0.98 : 1 }}
                  disabled={mockProduct.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{mockProduct.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}</span>
                </motion.button>

                {/* Buy Now Button */}
                <motion.button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed"
                  whileHover={{ scale: mockProduct.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: mockProduct.stock > 0 ? 0.98 : 1 }}
                  disabled={mockProduct.stock === 0}
                >
                  {mockProduct.stock > 0 ? 'Beli Sekarang' : 'Stok Habis'}
                </motion.button>

                {/* Like/Wishlist Button */}
                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-full py-3 px-6 rounded-lg font-medium border-2 transition-colors flex items-center justify-center space-x-2 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'border-neutral-300 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Disukai' : 'Sukai'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
