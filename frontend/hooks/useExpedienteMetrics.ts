import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { expedientesApi } from '@/lib/api/expedientes';
import { ExpedienteMetrics } from '@/types/expediente.types';

export function useExpedienteMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    '/expedientes/stats',
    async () => {
      const response = await expedientesApi.getStats();
      return response.data.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    metrics: data as ExpedienteMetrics | undefined,
    loading: isLoading,
    error,
    refresh,
  };
}
