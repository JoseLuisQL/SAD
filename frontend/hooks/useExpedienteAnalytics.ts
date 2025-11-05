import { useCallback } from 'react';
import useSWR from 'swr';
import { expedientesApi } from '@/lib/api/expedientes';
import { ExpedienteAnalytics } from '@/types/expediente.types';

export function useExpedienteAnalytics(expedienteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    expedienteId ? `/expedientes/${expedienteId}/analytics` : null,
    async () => {
      if (!expedienteId) return null;
      const response = await expedientesApi.getAnalytics(expedienteId);
      return response.data.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    analytics: data as ExpedienteAnalytics | undefined,
    loading: isLoading,
    error,
    refresh,
  };
}
