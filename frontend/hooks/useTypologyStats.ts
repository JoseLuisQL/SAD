import { useState, useCallback, useEffect } from 'react';
import { officesApi } from '@/lib/api/offices';
import { documentTypesApi } from '@/lib/api/document-types';
import { periodsApi } from '@/lib/api/periods';
import { toast } from 'sonner';

type TypologyType = 'office' | 'documentType' | 'period';

interface StatsData {
  total: number;
  active: number;
  inactive: number;
  recentlyCreated?: number;
  mostUsed?: Array<{
    id: string;
    code: string;
    name: string;
    count: number;
  }>;
}

export function useTypologyStats(type: TypologyType) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      switch (type) {
        case 'office':
          response = await officesApi.getStats();
          break;
        case 'documentType':
          response = await documentTypesApi.getStats();
          break;
        case 'period':
          response = await periodsApi.getStats();
          break;
      }

      const data = response.data.data;

      // Transformar datos para el formato esperado
      const transformedStats: StatsData = {
        total: data.total || 0,
        active: data.active || 0,
        inactive: data.inactive || 0,
        recentlyCreated: data.recentlyCreated?.length || 0,
        mostUsed: data.mostUsed?.map((item: any) => ({
          id: item.id,
          code: item.code || String(item.year),
          name: item.name || `Periodo ${item.year}`,
          count: item._count?.documents || item._count?.archivadores || 0,
        })) || [],
      };

      setStats(transformedStats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh };
}
