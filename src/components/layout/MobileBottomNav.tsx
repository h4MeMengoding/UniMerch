"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Search, List, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    // load recent searches
    try {
      const raw = localStorage.getItem('recentSearches');
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 80);
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const doSearch = (q: string) => {
    const value = q.trim();
    if (!value) return;
    try {
      const next = [value, ...recent.filter(r => r !== value)].slice(0, 6);
      localStorage.setItem('recentSearches', JSON.stringify(next));
      setRecent(next);
    } catch {}
    // navigate to search page
    window.location.href = `/?search=${encodeURIComponent(value)}`;
  };

  const clearRecent = () => {
    localStorage.removeItem('recentSearches');
    setRecent([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-24"
        >
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-lg z-[10000]"
          >
            <div className="bg-white dark:bg-dark-900 rounded-xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-neutral-100 dark:bg-dark-800">
                  <Search className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Cari produk, kategori, atau kode..."
                    className="w-full bg-neutral-50 dark:bg-dark-800 border border-transparent focus:border-primary-500 rounded-lg py-3 px-4 text-neutral-900 dark:text-neutral-100 outline-none"
                    aria-label="Cari produk atau kategori"
                    onKeyDown={(e) => { if (e.key === 'Enter') doSearch(query); }}
                  />
                </div>
                <button onClick={onClose} aria-label="Tutup pencarian" className="ml-2 text-neutral-500 hover:text-neutral-700">✕</button>
              </div>

              <div className="mt-3">
                {query.trim() === '' ? (
                  <>
                    {recent.length > 0 ? (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Pencarian terakhir</h4>
                          <button onClick={clearRecent} className="text-xs text-neutral-500 hover:underline">Hapus</button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {recent.map((r) => (
                            <button key={r} onClick={() => doSearch(r)} className="text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-800">{r}</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-neutral-500">Mulai ketik untuk mencari produk atau kategori</div>
                    )}
                  </>
                ) : (
                  <div className="mt-2">
                    <div className="text-sm text-neutral-500 mb-2">Hasil untuk <strong className="text-neutral-700 dark:text-neutral-200">{query}</strong></div>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-dark-800">Tidak ada hasil cepat — tekan Enter untuk melihat hasil lengkap.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const [showSearch, setShowSearch] = useState(false);

  const items = [
    { label: "Beranda", href: "/", Icon: Home },
    { label: "Keranjang", href: "/cart", Icon: ShoppingCart },
    { label: "Search", href: "/search", Icon: Search },
    { label: "Pesanan", href: "/user/orders", Icon: List },
    { label: "Akun", href: "/user/dashboard", Icon: User },
  ];

  // close search when navigating away (safety)
  useEffect(() => setShowSearch(false), [pathname]);

  // Hide mobile bottom nav on product detail page
  const isProductDetailPage = pathname.startsWith('/product/');

  if (isProductDetailPage) {
    return <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />;
  }

  return (
    <>
      <nav
        aria-label="Navigasi bawah"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-dark-950 border-t border-neutral-200 dark:border-dark-800"
      >
        <div className="max-w-7xl mx-auto px-3">
          <ul className="flex justify-between items-center py-2">
            {items.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.Icon;

              // Make Search open the modal instead of navigating
              if (item.href === "/search") {
                return (
                  <li key={`${item.href}-${item.label}`} className="flex-1">
                    <button
                      onClick={() => setShowSearch(true)}
                      className={`w-full flex flex-col items-center justify-center text-center py-1 px-2 ${
                        active ? "text-primary-600" : "text-neutral-500 dark:text-neutral-400"
                      } hover:text-primary-600`}
                      aria-label="Buka pencarian"
                    >
                      <Icon className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] leading-none mt-0.5">{item.label}</span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={`${item.href}-${item.label}`} className="flex-1">
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center text-center py-1 px-2 ${
                      active ? "text-primary-600" : "text-neutral-500 dark:text-neutral-400"
                    } hover:text-primary-600`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] leading-none mt-0.5">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
