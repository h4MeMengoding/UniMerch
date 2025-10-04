'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessContent({ searchParams }: { searchParams: { order?: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/user/dashboard?payment=success');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-950">
      <div className="bg-green-100 dark:bg-green-900/30 p-8 rounded-xl shadow-lg text-center max-w-md">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
          Pembayaran Berhasil! 🎉
        </h1>
        
        <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
          Terima kasih, pembayaran Anda telah diterima dan sedang diproses.
        </p>
        
        {searchParams.order && (
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Nomor Pesanan: <span className="font-semibold">#{searchParams.order}</span>
          </p>
        )}
        
        <div className="space-y-3">
          <Link 
            href="/user/dashboard?payment=success" 
            className="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Lihat Status Pesanan
          </Link>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Anda akan diarahkan otomatis dalam 3 detik...
          </p>
        </div>
      </div>
    </div>
  );
}