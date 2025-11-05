import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated && pathname !== ROUTES.LOGIN) {
        router.push(ROUTES.LOGIN);
      } else if (!requireAuth && isAuthenticated && pathname === ROUTES.LOGIN) {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, pathname, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

export const useRequireAuth = () => {
  return useAuth(true);
};

export const useGuestOnly = () => {
  return useAuth(false);
};
