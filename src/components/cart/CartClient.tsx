"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Trash2, AlertTriangle, X } from 'lucide-react';

type Item = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
};

export default function CartClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(
    initialItems.map((it) => ({ ...it }))
  );

  // Show a dismissible alert indicating this cart is a dummy and not linked to account
  const [showDummyAlert, setShowDummyAlert] = useState<boolean>(true);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('cart_dummy_alert_dismissed');
      if (dismissed === '1') setShowDummyAlert(false);
    } catch (e) {
      // ignore
    }
  }, []);

  const dismissDummyAlert = () => {
    try {
      sessionStorage.setItem('cart_dummy_alert_dismissed', '1');
    } catch (e) {
      // ignore
    }
    setShowDummyAlert(false);
  };

  const [selectedIds, setSelectedIds] = useState<string[]>(items.map(i => i.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => prev.map(it => it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter(it => it.id !== id));
    setSelectedIds((prev) => prev.filter(x => x !== id));
  };

  const subtotal = useMemo(() => {
    return items
      .filter(i => selectedIds.includes(i.id))
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items, selectedIds]);

  const total = subtotal; // shipping removed per requirements

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Keranjang Belanja</h1>

      {showDummyAlert && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Perhatian</div>
            <div className="mt-1">Halaman keranjang ini bersifat dummy dan tidak terhubung dengan akun pengguna. Data tidak disimpan ke server.</div>
          </div>
          <button onClick={dismissDummyAlert} aria-label="Tutup pemberitahuan" className="text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="p-8 bg-white dark:bg-dark-800 rounded-lg text-center text-neutral-600">Keranjang kosong</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-neutral-200 dark:border-dark-700"
              >
                {/* Desktop: grid layout for item (image | details | actions) */}
                <div className="flex items-center space-x-4 md:space-x-6 lg:items-start lg:space-x-8">
                  <div className="flex items-center">
                    <input
                      aria-label={`Pilih ${item.name}`}
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                  </div>

                  <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 rounded overflow-hidden bg-neutral-100 dark:bg-dark-700">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={128} height={128} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                      <div>
                        <p className="text-sm md:text-base font-medium text-neutral-900 dark:text-white">{item.name}</p>
                        {/* description and category intentionally hidden in cart */}
                      </div>

                      <div className="text-right">
                        <p className="text-sm md:text-base font-medium text-neutral-900 dark:text-white">Rp {item.price.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    {/* Actions: quantity + remove. Desktop shows larger buttons aligned right */}
                    <div className="mt-3 flex items-center justify-start md:justify-end space-x-3">
                      <button aria-label="Kurangi" onClick={() => updateQty(item.id, -1)} className="p-2 bg-neutral-100 dark:bg-dark-700 rounded">
                        <Minus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </button>
                      <div className="px-3 py-1 border rounded text-sm text-neutral-700 dark:text-neutral-300">{item.quantity}</div>
                      <button aria-label="Tambah" onClick={() => updateQty(item.id, 1)} className="p-2 bg-neutral-100 dark:bg-dark-700 rounded">
                        <Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                      </button>
                      <button aria-label="Hapus" onClick={() => removeItem(item.id)} className="p-2 ml-2 text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop-only: per-item total on large screens */}
                <div className="hidden lg:flex justify-end mt-3">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">Total: Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-neutral-200 dark:border-dark-700 md:sticky md:top-20">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-semibold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-dark-700">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Lanjut ke Pembayaran</button>
        </aside>
      </div>
    </div>
  );
}
