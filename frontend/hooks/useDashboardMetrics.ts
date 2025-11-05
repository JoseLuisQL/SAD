'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardSnapshot } from '@/lib/api/dashboard';
import { toast } from 'sonner';

interface UseDashboardMetricsOptions {
  initialRange?: '7d' | '30d' | '90d';
  initialOfficeId?: string;
}

interface UseDashboardMetricsReturn {
  data: DashboardSnapshot | null;
  isLoading: boolean;
  error: string | null;
  range: '7d' | '30d' | '90d';
  officeId: string | undefined;
  setRange: (range: '7d' | '30d' | '90d') => void;
  setOfficeId: (officeId: string | undefined) => void;
  refresh: () => Promise<void>;
}

export function useDashboardMetrics(
  options?: UseDashboardMetricsOptions
): UseDashboardMetricsReturn {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getStoredRange = (): '7d' | '30d' | '90d' => {
    if (typeof window === 'undefined') return '90d';
    const stored = localStorage.getItem('dashboard_range');
    if (stored === '7d' || stored === '30d' || stored === '90d') {
      return stored;
    }
    return '90d';
  };

  const [range, setRangeState] = useState<'7d' | '30d' | '90d'>(
    options?.initialRange || getStoredRange()
  );
  const [officeId, setOfficeIdState] = useState<string | undefined>(
    options?.initialOfficeId
  );

  const setRange = useCallback((newRange: '7d' | '30d' | '90d') => {
    setRangeState(newRange);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_range', newRange);
    }
  }, []);

  const setOfficeId = useCallback((newOfficeId: string | undefined) => {
    setOfficeIdState(newOfficeId);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dashboardApi.getSnapshot({
        range,
        officeId
      });

      setData(response.data.data || null);
    } catch (err: any) {
      let message = 'Error al cargar métricas del dashboard';
      
      // Handle axios error structure
      if (err?.response) {
        // Server responded with error
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          message = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        } else if (status === 403) {
          message = 'No tiene permisos para ver el dashboard.';
        } else if (status === 404) {
          message = 'El endpoint de métricas no está disponible.';
        } else if (status >= 500) {
          message = 'Error del servidor. Intente nuevamente más tarde.';
        } else if (data?.message) {
          message = data.message;
        }
      } else if (err?.status) {
        // Handle transformed error from interceptor (ApiError)
        const status = err.status;
        
        if (status === 401) {
          message = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        } else if (status === 403) {
          message = 'No tiene permisos para ver el dashboard.';
        } else if (status === 404) {
          message = 'El endpoint de métricas no está disponible.';
        } else if (status >= 500) {
          message = 'Error del servidor. Intente nuevamente más tarde.';
        } else if (err.message) {
          message = err.message;
        }
      } else if (err?.request) {
        // Request made but no response
        message = 'No se pudo conectar con el servidor. Verifique su conexión.';
      } else if (err?.message && typeof err.message === 'string') {
        // Generic error with message
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
      console.error('Dashboard metrics error:', {
        message,
        errorType: err?.response ? 'axios' : err?.status ? 'api' : 'unknown',
        status: err?.response?.status || err?.status,
        data: err?.response?.data || err?.errors,
        fullError: err
      });
      
      // Show toast notification for critical errors
      if (err?.response?.status === 401 || err?.status === 401) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [range, officeId]);

  const refresh = useCallback(async () => {
    await fetchData();
    toast.success('Dashboard actualizado');
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    range,
    officeId,
    setRange,
    setOfficeId,
    refresh
  };
}
