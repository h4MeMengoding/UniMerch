'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to universal login page
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}
