import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { expedientesApi } from '@/lib/api/expedientes';
import { ExpedienteActivity } from '@/types/expediente.types';

interface UseExpedienteActivityOptions {
  expedienteId: string;
  page?: number;
  limit?: number;
}

export function useExpedienteActivity({
  expedienteId,
  page = 1,
  limit = 20,
}: UseExpedienteActivityOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    expedienteId ? `/expedientes/${expedienteId}/activity?page=${page}&limit=${limit}` : null,
    async () => {
      if (!expedienteId) return null;
      const response = await expedientesApi.getActivity(expedienteId, page, limit);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    activities: (data?.data || []) as ExpedienteActivity[],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    loading: isLoading,
    error,
    refresh,
  };
}
