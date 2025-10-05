'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Eye, 
  Check, 
  User,
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Order {
  id: number;
  status: 'BELUM_DIBAYAR' | 'DIBAYAR' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'SELESAI';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  payment?: {
    id: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
    xenditInvoiceId: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filterOrders = () => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `ORD-${order.id.toString().padStart(6, '0')}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, filterOrders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error('Gagal memuat pesanan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const formatOrderCode = (orderId: number, createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return `#${String(orderId).padStart(8, '0')}`;
      }
      
      const year = String(date.getUTCFullYear()).slice(-2);
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const orderNum = orderId > 9999 
        ? String(orderId % 10000).padStart(4, '0')
        : String(orderId).padStart(4, '0');
      
      return `#${year}${month}${day}${orderNum}`;
    } catch {
      return `#${String(orderId).padStart(8, '0')}`;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIBAYAR':
        return 'bg-green-100 text-green-800';
      case 'BELUM_DIBAYAR':
        return 'bg-red-100 text-red-800';
      case 'SIAP_DIAMBIL':
        return 'bg-blue-100 text-blue-800';
      case 'SUDAH_DIAMBIL':
        return 'bg-indigo-100 text-indigo-800';
      case 'SELESAI':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DIBAYAR':
        return 'Dibayar';
      case 'BELUM_DIBAYAR':
        return 'Belum Dibayar';
      case 'SIAP_DIAMBIL':
        return 'Siap Diambil';
      case 'SUDAH_DIAMBIL':
        return 'Sudah Diambil';
      case 'SELESAI':
        return 'Selesai';
      default:
        return status;
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status pesanan berhasil diperbarui');
        fetchOrders();
        setShowDetailModal(false);
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal memperbarui status pesanan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memperbarui status pesanan');
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'DIBAYAR':
        return 'SIAP_DIAMBIL';
      case 'SIAP_DIAMBIL':
        return 'SUDAH_DIAMBIL';
      case 'SUDAH_DIAMBIL':
        return 'SELESAI';
      default:
        return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getStatusText(nextStatus) : null;
  };

  if (loading) {
    return (
      <AdminLayout currentPage="manage-orders">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="manage-orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Kelola Pesanan
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Kelola dan update status pesanan pelanggan
            </p>
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total: {filteredOrders.length} pesanan
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari pesanan, pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-neutral-900 dark:text-white appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="DIBAYAR">Dibayar</option>
                <option value="SIAP_DIAMBIL">Siap Diambil</option>
                <option value="SUDAH_DIAMBIL">Sudah Diambil</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-neutral-200 dark:border-dark-700">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang ditemukan'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {orders.length === 0 
                  ? 'Pesanan dari pelanggan akan muncul di sini'
                  : 'Coba ubah kata kunci pencarian atau filter Anda'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 dark:bg-dark-700">
                    <tr>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Pesanan</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Produk</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Pelanggan</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Total</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Status</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Tanggal</th>
                      <th className="text-left py-3 px-6 text-neutral-600 dark:text-neutral-400 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-100 dark:border-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-700/50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-white">
                              {formatOrderCode(order.id, order.createdAt)}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {order.items.length} item
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {/* Show first product thumbnail */}
                            <div className="flex-shrink-0">
                              <img
                                src={order.items[0]?.product.image || '/api/placeholder/40/40'}
                                alt={order.items[0]?.product.name}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-neutral-900 dark:text-white truncate">
                                {order.items[0]?.product.name}
                              </div>
                              {order.items.length > 1 && (
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                  +{order.items.length - 1} produk lainnya
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-white">
                              {order.user.name}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {order.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-neutral-900 dark:text-white">
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => openDetailModal(order)}
                            className="inline-flex items-center px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-neutral-50 dark:bg-dark-700 rounded-lg p-4 space-y-3">
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {formatOrderCode(order.id, order.createdAt)}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={order.items[0]?.product.image || '/api/placeholder/50/50'}
                        alt={order.items[0]?.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {order.items[0]?.product.name}
                        </div>
                        {order.items.length > 1 && (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            +{order.items.length - 1} produk lainnya
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer & Total */}
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Pelanggan</div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {order.user.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Total</div>
                        <div className="font-bold text-neutral-900 dark:text-white">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openDetailModal(order)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && closeDetailModal()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-dark-700">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      Detail Pesanan {formatOrderCode(selectedOrder.id, selectedOrder.createdAt)}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                      Informasi Pelanggan
                    </h3>
                    <div className="bg-neutral-50 dark:bg-dark-700 rounded-lg p-4 space-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                        <span className="text-neutral-900 dark:text-white">{selectedOrder.user.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-neutral-500 dark:text-neutral-400 mr-2">✉</span>
                        <span className="text-neutral-900 dark:text-white">{selectedOrder.user.email}</span>
                      </div>
                      {selectedOrder.user.phone && (
                        <div className="flex items-center">
                          <span className="text-neutral-500 dark:text-neutral-400 mr-2">📞</span>
                          <span className="text-neutral-900 dark:text-white">{selectedOrder.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                      Item Pesanan
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-dark-700 rounded-lg">
                          <img
                            src={item.product.image || '/api/placeholder/60/60'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {item.product.name}
                            </h4>
                            <p className="text-neutral-600 dark:text-neutral-400">
                              {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                      Ringkasan Pesanan
                    </h3>
                    <div className="bg-neutral-50 dark:bg-dark-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {selectedOrder.payment && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Status Pembayaran:</span>
                          <span className="text-neutral-900 dark:text-white">
                            {selectedOrder.payment.status === 'PAID' ? 'Lunas' : selectedOrder.payment.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-neutral-200 dark:border-dark-700">
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 border border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Tutup
                  </button>
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Memperbarui...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Update ke {getNextStatusText(selectedOrder.status)}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}