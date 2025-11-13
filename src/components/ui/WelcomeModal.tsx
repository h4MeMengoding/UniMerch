'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Get delay from env or default to 0 (can close immediately)
  const closeDelay = parseInt(process.env.NEXT_PUBLIC_MODAL_CLOSE_DELAY || '0', 10);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      // Reset state when modal opens
      setCanClose(closeDelay === 0);
      setTimeLeft(closeDelay);

      // Start countdown if delay is set
      if (closeDelay > 0) {
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setCanClose(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => {
          clearInterval(interval);
          document.body.style.overflow = '';
        };
      }

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open, closeDelay]);

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-white dark:bg-dark-900 rounded-xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                disabled={!canClose}
                className={`absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors ${
                  canClose
                    ? 'hover:bg-neutral-100 dark:hover:bg-dark-800 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={canClose ? 'Tutup' : `Baca dulu, ${timeLeft} detik lagi`}
                title={canClose ? 'Tutup' : `Baca dulu, ${timeLeft} detik lagi`}
              >
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>

              {/* Content */}
              <div className="px-6 py-8 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Info className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Heading */}
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Website Dalam Pengembangan
                </h2>

                {/* Description */}
                <div className="text-left space-y-3 mb-6 max-h-[60vh] overflow-y-auto px-1">
                  {/* Fitur yang Sudah Berfungsi */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
                      Fitur yang Sudah Berfungsi
                    </h3>
                    <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc list-inside">
                      <li>Pemilihan produk & proses checkout.</li>
                      <li>Pembayaran otomatis melalui payment gateway.</li>
                      <li>Login & signup pengguna.</li>
                      <li>Admin kelola barang & pesanan.</li>
                      <li>QR Code untuk pengambilan barang.</li>
                    </ul>
                  </div>

                  {/* Fitur yang Masih Dalam Pengembangan */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
                      Fitur yang Masih Dalam Pengembangan
                    </h3>
                    <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc list-inside">
                      <li>Beberapa halaman dan elemen UI masih berupa <span className="italic">dummy</span>.</li>
                      <li>Sebagian fitur tambahan masih tahap penyempurnaan & uji coba.</li>
                      <li>Beberapa data belum final dan hanya sebagai placeholder.</li>
                    </ul>
                  </div>

                  {/* Catatan */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
                      Catatan
                    </h3>
                    <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc list-inside">
                      <li>Fitur inti transaksi <span className="font-semibold">sudah stabil</span> dan dapat digunakan.</li>
                      <li>Pembayaran dengan payment gateway bersifat demo (simulasi).</li>
                    </ul>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={handleClose}
                  disabled={!canClose}
                  className={`w-full font-medium py-2.5 px-6 rounded-lg transition-colors ${
                    canClose
                      ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                      : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {canClose ? 'Mengerti' : `Baca dulu, ${timeLeft} detik lagi`}
                </button>

                {/* Don't Show Again - REMOVED, modal auto-hides after first view */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
