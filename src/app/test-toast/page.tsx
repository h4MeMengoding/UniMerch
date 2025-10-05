'use client';

import { toast } from 'react-toastify';

export default function ToastTestPage() {
  const showSuccessToast = () => {
    toast.success('🎉 Berhasil! Operasi telah selesai');
  };

  const showErrorToast = () => {
    toast.error('❌ Terjadi kesalahan! Silakan coba lagi');
  };

  const showInfoToast = () => {
    toast.info('ℹ️ Informasi penting untuk Anda');
  };

  const showWarningToast = () => {
    toast.warning('⚠️ Peringatan! Harap perhatikan hal ini');
  };

  const showDefaultToast = () => {
    toast('📋 Pesan default dengan konten yang lebih panjang untuk menguji tampilan toast dalam berbagai kondisi');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
          Toast Testing Page
        </h1>
        
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Test berbagai jenis toast untuk memastikan styling bekerja dengan baik di light dan dark mode.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={showSuccessToast}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Show Success Toast
            </button>

            <button
              onClick={showErrorToast}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Show Error Toast
            </button>

            <button
              onClick={showInfoToast}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Show Info Toast
            </button>

            <button
              onClick={showWarningToast}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Show Warning Toast
            </button>
          </div>

          <button
            onClick={showDefaultToast}
            className="w-full bg-neutral-600 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Show Default Toast (Long Message)
          </button>

          <div className="mt-8 p-4 bg-neutral-100 dark:bg-dark-800 rounded-lg">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Testing Instructions:
            </h3>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Klik tombol di atas untuk test berbagai jenis toast</li>
              <li>• Toggle theme untuk test di light dan dark mode</li>
              <li>• Resize browser untuk test responsivitas mobile</li>
              <li>• Toast akan muncul di kanan bawah (desktop) atau full-width (mobile)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}