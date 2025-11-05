import { create } from 'zustand';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '@/lib/constants';
import { User, LoginCredentials, AuthResponse } from '@/types/auth.types';

interface SecurityStatus {
  failedAttempts: number;
  lockedUntil: Date | null;
  isLocked: boolean;
}

interface EnhancedAuthError extends Error {
  code?: string;
  minutesRemaining?: number;
  lockedUntil?: string;
  failedAttempts?: number;
  remainingAttempts?: number;
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
      data?: Record<string, unknown>;
    };
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  securityStatus: SecurityStatus | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  fetchSecurityStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  securityStatus: null,

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const { user, accessToken, refreshToken } = response.data.data;

      Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, { expires: 1/96 }); // 15 min
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, { expires: 7 }); // 7 days
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      set({ user, isAuthenticated: true, isLoading: false, securityStatus: null });
    } catch (error: unknown) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      
      const authError = error as EnhancedAuthError;
      
      // Handle account locked error (423)
      if (authError?.response?.status === 423 && authError?.response?.data?.code === 'ACCOUNT_LOCKED') {
        const errorData = authError.response.data.data as Record<string, unknown>;
        const minutesRemaining = errorData?.minutesRemaining as number | undefined;
        const lockedUntil = errorData?.lockedUntil as string | undefined;
        const failedAttempts = errorData?.failedAttempts as number | undefined;
        
        set({
          securityStatus: {
            failedAttempts: failedAttempts || 5,
            lockedUntil: lockedUntil ? new Date(lockedUntil) : null,
            isLocked: true
          }
        });
        
        // Throw enhanced error with structured data
        const enhancedError: EnhancedAuthError = new Error(authError.response.data.message);
        enhancedError.code = 'ACCOUNT_LOCKED';
        enhancedError.minutesRemaining = minutesRemaining;
        enhancedError.lockedUntil = lockedUntil;
        throw enhancedError;
      }
      
      // Handle invalid credentials with remaining attempts (401)
      if (authError?.response?.status === 401 && authError?.response?.data?.code === 'INVALID_CREDENTIALS') {
        const errorData = authError.response.data.data as Record<string, unknown>;
        const failedAttempts = errorData?.failedAttempts as number | undefined;
        const remainingAttempts = errorData?.remainingAttempts as number | undefined;
        
        // Throw enhanced error with structured data
        const enhancedError: EnhancedAuthError = new Error(authError.response.data.message);
        enhancedError.code = 'INVALID_CREDENTIALS';
        enhancedError.failedAttempts = failedAttempts;
        enhancedError.remainingAttempts = remainingAttempts;
        throw enhancedError;
      }
      
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore logout errors
    } finally {
      Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
      
      set({ user: null, isAuthenticated: false, isLoading: false });
      
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
    }
  },

  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },

  checkAuth: async () => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER) : null;

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true, isLoading: false });
      }

      const response = await api.get<{ status: string; data: { user: User } }>(
        API_ENDPOINTS.AUTH.ME
      );

      const { user } = response.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      
      set({ user, isAuthenticated: true, isLoading: false });
      
      await get().fetchSecurityStatus();
    } catch {
      Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
      
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchSecurityStatus: async () => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return;

      const response = await api.get<{ 
        status: string; 
        data: SecurityStatus 
      }>(API_ENDPOINTS.AUTH.STATUS);

      set({ securityStatus: response.data.data });
    } catch (error) {
      console.error('Error fetching security status:', error);
    }
  },
}));
