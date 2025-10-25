"use client";

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Order {
  id: number;
  status: 'BELUM_DIBAYAR' | 'DIBAYAR' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'SELESAI';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    id: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
    paymentUrl?: string;
    xenditInvoiceId: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name?: string; image?: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const formatOrderCode = (orderId: number, createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return `#${String(orderId).padStart(8, '0')}`;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const id = String(orderId).padStart(5, '0');
      return `#${day}${month}${year}${id}`;
    } catch {
      return `#${String(orderId).padStart(8, '0')}`;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta'
      };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', hour12: false };
      const dateStr = date.toLocaleDateString('id-ID', dateOptions);
      const timeStr = date.toLocaleTimeString('id-ID', timeOptions);
      return `${dateStr} pukul ${timeStr} WIB`;
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user/orders');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-dark-950">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-6 max-w-7xl">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Daftar Pesanan</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Belum ada pesanan</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 sm:p-4 lg:p-6 bg-white dark:bg-dark-900">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">Pesanan {formatOrderCode(order.id, order.createdAt)}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'DIBAYAR' ? 'bg-green-100 text-green-800' : order.status === 'BELUM_DIBAYAR' ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-800'}`}>{order.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-dark-800 rounded-lg">
                      <img src={item.product?.image || '/api/placeholder/80/80'} alt={item.product?.name || 'Produk'} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{item.product?.name || 'Produk'}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">{item.quantity} × Rp {item.price.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-right font-semibold text-sm text-neutral-900 dark:text-neutral-100">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
