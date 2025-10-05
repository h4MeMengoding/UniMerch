'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to universal login page
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">Memuat...</p>
      </div>
    </div>
  );
}
