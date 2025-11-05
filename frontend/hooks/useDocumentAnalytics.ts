import { useState, useCallback } from 'react';
import { documentsApi } from '@/lib/api/documents';
import {
  DocumentIngestStats,
  DocumentAnalytics,
  DocumentAnalyticsFilters,
  DocumentIngestStatsResponse,
  DocumentAnalyticsResponse,
} from '@/types/document.types';
import { toast } from 'sonner';

export function useDocumentAnalytics() {
  const [ingestStats, setIngestStats] = useState<DocumentIngestStats | null>(null);
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [loadingIngestStats, setLoadingIngestStats] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchIngestStats = useCallback(async () => {
    try {
      setLoadingIngestStats(true);
      const response = await documentsApi.getIngestStats();
      const data = (response.data as DocumentIngestStatsResponse).data;
      setIngestStats(data);
    } catch (error: unknown) {
      console.error('Error al cargar estadísticas de ingesta:', error);
      toast.error('Error al cargar estadísticas de ingesta');
      setIngestStats(null);
    } finally {
      setLoadingIngestStats(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (filters?: DocumentAnalyticsFilters) => {
    try {
      setLoadingAnalytics(true);
      const response = await documentsApi.getAnalytics(filters);
      const data = (response.data as DocumentAnalyticsResponse).data;
      setAnalytics(data);
    } catch (error: unknown) {
      console.error('Error al cargar analítica de documentos:', error);
      toast.error('Error al cargar analítica de documentos');
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const clearAnalytics = useCallback(() => {
    setAnalytics(null);
  }, []);

  return {
    ingestStats,
    analytics,
    loadingIngestStats,
    loadingAnalytics,
    fetchIngestStats,
    fetchAnalytics,
    clearAnalytics,
  };
}
