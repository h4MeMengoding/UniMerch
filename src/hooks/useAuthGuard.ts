'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireRole?: 'ADMIN' | 'USER';
  redirectTo?: string;
}

export function useAuthGuard({
  requireAuth = true,
  requireRole,
  redirectTo = '/login'
}: UseAuthGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // Check if specific role is required
    if (requireRole && user?.role !== requireRole) {
      if (user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'USER') {
        router.push('/user/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }
  }, [user, isLoading, requireAuth, requireRole, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole: (role: 'ADMIN' | 'USER') => user?.role === role
  };
}