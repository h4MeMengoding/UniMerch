'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        toast.error('Gagal memuat kategori');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Terjadi kesalahan saat memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kategori berhasil ditambahkan!');
        setShowAddModal(false);
        setFormData({ name: '', description: '' });
        fetchCategories();
      } else {
        toast.error(data.message || 'Gagal menambahkan kategori');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kategori berhasil diperbarui!');
        setShowEditModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        fetchCategories();
      } else {
        toast.error(data.message || 'Gagal memperbarui kategori');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Terjadi kesalahan saat menghapus kategori');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return (
      <AdminLayout currentPage="categories">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="categories">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Kategori Produk
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Kelola kategori untuk produk merchandise
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Tags className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              Belum ada kategori
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Mulai dengan menambahkan kategori pertama
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-neutral-200 dark:border-dark-700 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <Tags className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {category.productCount || 0} produk
                        </p>
                      </div>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title="Edit kategori"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Category Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && closeModals()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-dark-700">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      Tambah Kategori Baru
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Buat kategori baru untuk produk
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Nama Kategori *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-neutral-900 dark:text-white placeholder-neutral-400"
                      placeholder="Masukkan nama kategori"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-neutral-900 dark:text-white placeholder-neutral-400 resize-none"
                      placeholder="Deskripsi kategori (opsional)"
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-6 py-3 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Simpan Kategori</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Category Modal */}
        <AnimatePresence>
          {showEditModal && editingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && closeModals()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-dark-700">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      Edit Kategori
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Perbarui informasi kategori
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleEdit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Nama Kategori *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-neutral-900 dark:text-white placeholder-neutral-400"
                      placeholder="Masukkan nama kategori"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-neutral-900 dark:text-white placeholder-neutral-400 resize-none"
                      placeholder="Deskripsi kategori (opsional)"
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-6 py-3 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Perbarui Kategori</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}