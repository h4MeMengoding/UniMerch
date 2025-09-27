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

// Mock data untuk product detail merchandise UNNES
const mockProduct = {
  id: '1',
  name: 'Jaket Hoodie UNNES Premium',
  price: 299000,
  originalPrice: 399000,
  images: [
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600'
  ],
  rating: 4.5,
  reviewCount: 128,
  category: 'Pakaian',
  brand: 'UniMerch',
  sku: 'UM-HD-001',
  stock: 24,
  isNew: true,
  isOnSale: true,
  description: 'Jaket hoodie premium dengan logo UNNES yang dirancang khusus untuk mahasiswa dan alumni. Terbuat dari bahan cotton fleece berkualitas tinggi yang nyaman dan hangat.',
  features: [
    'Bahan Cotton Fleece Premium',
    'Logo UNNES Bordir Eksklusif',
    'Kantong Depan dengan Resleting',
    'Hoodie dengan Tali Serut',
    'Rib di Lengan dan Hem',
    'Tersedia dalam Berbagai Ukuran'
  ],
  specifications: {
    'Bahan': 'Cotton Fleece 280gsm',
    'Jenis Bordir': 'Computer Embroidery',
    'Perawatan': 'Machine Wash 30°C',
    'Asal': 'Indonesia',
    'Sertifikasi': 'SNI Tekstil',
    'Ketebalan': 'Medium Weight'
  },
  colors: ['Navy', 'Maroon', 'Grey'],
  sizes: ['S', 'M', 'L', 'XL', 'XXL']
};

const mockReviews = [
  {
    id: '1',
    user: 'Ahmad Rizki',
    rating: 5,
    date: '2025-01-15',
    comment: 'Kualitas jaket sangat bagus! Bahan tebal dan nyaman. Logo UNNES nya keren banget!',
    helpful: 12
  },
  {
    id: '2',
    user: 'Sari Dewi',
    rating: 4,
    date: '2025-01-10',
    comment: 'Ukuran sesuai size chart. Warna navy nya bagus dan tidak mudah pudar. Recommended!',
    helpful: 8
  },
  {
    id: '3',
    user: 'Budi Santoso',
    rating: 5,
    date: '2025-01-05',
    comment: 'Sebagai alumni UNNES, ini wajib punya! Kualitas premium, packaging rapi. Top!',
    helpful: 15
  }
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
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

        {/* Product Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-100 dark:bg-dark-800 rounded-2xl overflow-hidden max-w-lg mx-auto">
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
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
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

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Brand & Category */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{mockProduct.brand}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">SKU: {mockProduct.sku}</span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">{mockProduct.name}</h1>

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
                <span className="text-sm text-neutral-500 dark:text-neutral-400">({mockProduct.reviewCount} reviews)</span>
              </div>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                See all reviews
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                {formatPrice(mockProduct.price)}
              </span>
              {mockProduct.originalPrice && mockProduct.originalPrice > mockProduct.price && (
                <span className="text-lg lg:text-xl text-neutral-500 dark:text-neutral-400 line-through">
                  {formatPrice(mockProduct.originalPrice)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold px-2 py-1 rounded">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${mockProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm ${mockProduct.stock > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {mockProduct.stock > 0 ? `${mockProduct.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <h3 className="font-medium text-neutral-900 dark:text-white">Color: {selectedColor}</h3>
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

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-neutral-900 dark:text-white">Quantity:</span>
                  <div className="flex items-center border border-neutral-300 dark:border-dark-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <span className="px-3 py-1.5 font-medium text-neutral-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(mockProduct.stock, quantity + 1))}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 transition-colors"
                      disabled={quantity >= mockProduct.stock}
                    >
                      <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={mockProduct.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2.5 rounded-lg border-2 transition-colors ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'border-neutral-300 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          {/* Tab Navigation */}
          <div className="border-b border-neutral-200 dark:border-dark-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Product Description</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{mockProduct.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-neutral-600 dark:text-neutral-300">
                        <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
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
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Customer Reviews</h3>
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-200 dark:border-dark-700 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-white">{review.user}</h4>
                          <div className="flex items-center space-x-2 mt-1">
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
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-2">{review.comment}</p>
                      <button className="flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                        <MessageCircle className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
