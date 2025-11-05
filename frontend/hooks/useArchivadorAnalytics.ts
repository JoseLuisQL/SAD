import { useState, useCallback } from 'react';
import { archivadoresApi } from '@/lib/api/archivadores';
import {
  ArchivadorAnalyticsOverview,
  ArchivadorAnalytics,
} from '@/types/archivador.types';
import { toast } from 'sonner';

export function useArchivadorAnalytics() {
  const [overview, setOverview] = useState<ArchivadorAnalyticsOverview | null>(null);
  const [detailAnalytics, setDetailAnalytics] = useState<ArchivadorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const response = await archivadoresApi.getGeneralStats();

      setOverview(response.data.data);
    } catch (error: unknown) {
      console.error('Error al cargar analytics overview:', error);
      toast.error('Error al cargar estadísticas generales');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetailAnalytics = useCallback(async (archivadorId: string) => {
    try {
      setLoadingDetail(true);
      const response = await archivadoresApi.getAnalytics(archivadorId);

      setDetailAnalytics(response.data.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al cargar analytics de archivador:', error);
      toast.error('Error al cargar analítica del archivador');
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const clearDetailAnalytics = useCallback(() => {
    setDetailAnalytics(null);
  }, []);

  return {
    overview,
    detailAnalytics,
    loading,
    loadingDetail,
    fetchOverview,
    fetchDetailAnalytics,
    clearDetailAnalytics,
  };
}
