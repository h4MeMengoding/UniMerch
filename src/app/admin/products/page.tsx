'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Package,
  Upload,
  Trash,
  GripVertical
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew: boolean;
  isOnSale: boolean;
  stock: number;
  hasVariants: boolean;
  variants?: {
    id: number;
    name: string;
    options: {
      id: number;
      name: string;
      image?: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface VariantType {
  id: number;
  name: string;
}

interface VariantOption {
  id: string;
  name: string;
  image?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
}

export default function AdminProducts() {
  const { user, isLoading: authLoading } = useAuthGuard({
    requireAuth: true,
    requireRole: 'ADMIN'
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    category: '',
    isNew: false,
    isOnSale: false,
    stock: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only proceed if user is authenticated as admin
    if (user?.role === 'ADMIN') {
      fetchProducts();
      fetchCategories();
      fetchVariantTypes();
    }
  }, [user]);

  const fetchVariantTypes = async () => {
    try {
      const response = await fetch('/api/admin/variant-types');
      if (response.ok) {
        const data = await response.json();
        setVariantTypes(data || []);
      } else {
        console.error('Failed to fetch variant types');
      }
    } catch (error) {
      console.error('Error fetching variant types:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      category: '',
      isNew: false,
      isOnSale: false,
      stock: ''
    });
    setHasVariants(false);
    setVariants([]);
    setImageFile(null);
    setImagePreview('');
    // Refresh categories when opening add modal
    fetchCategories();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHasVariants(false);
    setVariants([]);
    setImageFile(null);
    setImagePreview('');
  };

  // Variant management functions
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addVariant = () => {
    if (variants.length >= 3) return;
    const newVariant: ProductVariant = {
      id: generateId(),
      name: '',
      options: [{ id: generateId(), name: '', image: '' }]
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const updateVariantName = (variantId: string, name: string) => {
    setVariants(variants.map(v => 
      v.id === variantId ? { ...v, name } : v
    ));
  };

  const addOption = (variantId: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId && v.options.length < 10) {
        return {
          ...v,
          options: [...v.options, { id: generateId(), name: '', image: '' }]
        };
      }
      return v;
    }));
  };

  const removeOption = (variantId: string, optionId: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          options: v.options.filter(o => o.id !== optionId)
        };
      }
      return v;
    }));
  };

  const updateOptionName = (variantId: string, optionId: string, name: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          options: v.options.map(o => 
            o.id === optionId ? { ...o, name } : o
          )
        };
      }
      return v;
    }));
  };

  const createCustomVariantType = async (name: string) => {
    try {
      const response = await fetch('/api/admin/variant-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newVariantType = await response.json();
        setVariantTypes([...variantTypes, newVariantType]);
        return newVariantType;
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menambahkan varian baru');
        return null;
      }
    } catch (error) {
      console.error('Error creating variant type:', error);
      alert('Gagal menambahkan varian baru');
      return null;
    }
  };

  // Custom Variant Selector Component
  const VariantSelector = ({ variant, onUpdate }: { variant: ProductVariant, onUpdate: (name: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleSelect = (variantTypeName: string) => {
      onUpdate(variantTypeName);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomInput('');
    };

    const handleAddCustom = async () => {
      if (customInput.trim()) {
        const newVariantType = await createCustomVariantType(customInput.trim());
        if (newVariantType) {
          onUpdate(newVariantType.name);
          setIsOpen(false);
          setShowCustomInput(false);
          setCustomInput('');
        }
      }
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 text-left border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-neutral-900 dark:text-white flex items-center justify-between"
        >
          <span className={variant.name ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}>
            {variant.name || 'Pilih atau masukkan varian'}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-700 border border-neutral-300 dark:border-dark-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {variantTypes.map((variantType) => (
              <button
                key={variantType.id}
                type="button"
                onClick={() => handleSelect(variantType.name)}
                className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-dark-600 text-neutral-900 dark:text-white"
              >
                {variantType.name}
              </button>
            ))}
            
            <div className="border-t border-neutral-200 dark:border-dark-600">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full px-3 py-2 text-left text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah baru</span>
                </button>
              ) : (
                <div className="p-3">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Nama varian baru"
                    className="w-full p-2 mb-2 border border-neutral-300 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-neutral-900 dark:text-white text-sm"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomInput('');
                      }}
                      className="px-3 py-1 bg-neutral-300 hover:bg-neutral-400 text-neutral-700 text-sm rounded"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      image: product.image,
      category: product.category,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      stock: product.stock.toString()
    });
    
    // Set image preview from existing product
    setImagePreview(product.image);
    setImageFile(null);
    
    // Load variants if they exist
    if (product.hasVariants && product.variants) {
      setHasVariants(true);
      setVariants(product.variants.map(variant => ({
        id: variant.id.toString(),
        name: variant.name,
        options: variant.options.map(option => ({
          id: option.id.toString(),
          name: option.name,
          image: option.image || ''
        }))
      })));
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?\n\nProduk yang sudah dibeli akan tetap ada di riwayat pembeli, tetapi pesanan yang belum dibayar tidak dapat diselesaikan.')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        let message = data.message || 'Produk berhasil dihapus';
        
        if (data.affectedOrders > 0) {
          message += `\n\nℹ️ Informasi:`;
          message += `\n• ${data.affectedOrders} pesanan menggunakan produk ini`;
          if (data.unpaidOrders > 0) {
            message += `\n• ${data.unpaidOrders} pesanan belum dibayar akan diblokir`;
          }
        }
        
        alert(message);
        fetchProducts(); // Refresh the list
      } else {
        alert(data.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipe file tidak valid. Hanya JPEG, PNG, WebP, dan GIF yang diperbolehkan.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'gambar-produk');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengunggah gambar: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload image first if there's a new file
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          alert('Gagal mengunggah gambar');
          return;
        }
        imageUrl = uploadedUrl;
      }

      // Validate image URL
      if (!imageUrl) {
        alert('Silakan upload gambar produk');
        return;
      }

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Prepare data with variants
      const productData = {
        ...formData,
        image: imageUrl,
        hasVariants,
        variants: hasVariants ? variants.filter(v => v.name && v.options.length > 0) : []
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        handleCloseModal(); // Use the new close handler
        fetchProducts(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Terjadi kesalahan saat menyimpan produk');
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout currentPage="manage-products">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="manage-products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Kelola Produk
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Tambah, edit, dan hapus produk merchandise
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center">
              Menampilkan {filteredProducts.length} dari {products.length} produk
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                {products.length === 0 ? 'Belum ada produk' : 'Tidak ada produk yang ditemukan'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {products.length === 0 
                  ? 'Mulai dengan menambahkan produk pertama Anda'
                  : 'Coba ubah kata kunci pencarian Anda'
                }
              </p>
              {products.length === 0 && (
                <button
                  onClick={handleAddProduct}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Tambah Produk Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-dark-700">
                  <tr>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Produk</th>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Kategori</th>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Harga</th>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Stok</th>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Status</th>
                    <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-neutral-100 dark:border-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-700/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-neutral-100 dark:bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2 whitespace-pre-line">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-dark-600 text-neutral-800 dark:text-neutral-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            Rp {product.price.toLocaleString('id-ID')}
                          </p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-xs text-neutral-500 line-through">
                              Rp {product.originalPrice.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-1">
                          {product.isNew && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              NEW
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              SALE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
          ></div>
          <div className="relative bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-dark-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Kategori
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Harga Asli (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Gambar Produk
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-full h-48 bg-neutral-100 dark:bg-dark-600 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={400}
                          height={400}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-neutral-50 dark:bg-dark-700"
                      >
                        <Upload className="w-12 h-12 text-neutral-400 mb-3" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-neutral-500">
                          JPEG, PNG, WebP, GIF (Max. 5MB)
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
                  placeholder="Deskripsi produk..."
                />
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Produk Baru</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isOnSale}
                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Sedang Sale</span>
                </label>
              </div>

              {/* Product Variants Section */}
              <div className="border-t border-neutral-200 dark:border-dark-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => {
                          setHasVariants(e.target.checked);
                          if (!e.target.checked) {
                            setVariants([]);
                          } else if (variants.length === 0) {
                            // Auto-add first variant when enabled
                            addVariant();
                          }
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Tambah varian</span>
                    </label>
                  </div>
                </div>

                {hasVariants && (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tambahkan hingga 3 varian produk untuk beragam ukuran, warna, bahan, atau yang lain.
                    </p>
                    
                    {variants.map((variant) => (
                      <div key={variant.id} className="border border-neutral-200 dark:border-dark-700 rounded-lg p-4 bg-neutral-50 dark:bg-dark-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Nama Varian
                            </span>
                            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">?</span>
                            </div>
                          </div>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <VariantSelector
                            variant={variant}
                            onUpdate={(name) => updateVariantName(variant.id, name)}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Opsi</span>
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                                />
                                <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">Tambahkan gambar</span>
                              </label>
                            </div>
                          </div>

                          {variant.options.map((option, optionIndex) => (
                            <div key={option.id} className="flex items-center space-x-3 p-3 border border-neutral-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                              <div className="flex-shrink-0 w-12 h-12 border-2 border-dashed border-neutral-300 dark:border-dark-600 rounded-lg flex items-center justify-center bg-neutral-50 dark:bg-dark-800">
                                {option.image ? (
                                  <Image
                                    src={option.image}
                                    alt={option.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Upload className="w-5 h-5 text-neutral-400" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder={`opsi ${optionIndex + 1}`}
                                  value={option.name}
                                  onChange={(e) => updateOptionName(variant.id, option.id, e.target.value)}
                                  className="w-full p-2 border-0 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-0 focus:outline-none"
                                  maxLength={50}
                                />
                                <div className="text-xs text-neutral-400 text-right">
                                  {option.name.length}/50
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {variant.options.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(variant.id, option.id)}
                                    className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="cursor-move text-neutral-400">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          ))}

                          {variant.options.length < 10 && (
                            <button
                              type="button"
                              onClick={() => addOption(variant.id)}
                              className="w-full p-2 border border-dashed border-neutral-300 dark:border-dark-600 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm"
                            >
                              Tambahkan nilai lain
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {variants.length < 3 && (
                      <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah variasi</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isUploading}
                  className="px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-dark-600 hover:bg-neutral-200 dark:hover:bg-dark-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'Update' : 'Simpan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}