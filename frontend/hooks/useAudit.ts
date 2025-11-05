import { useState, useCallback } from 'react';
import { auditApi } from '@/lib/api/audit';
import { AuditLog, AuditLogDetail, AuditStats, AuditLogsFilters } from '@/types/audit.types';
import { toast } from 'sonner';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = useCallback(async (filters: AuditLogsFilters = {}) => {
    try {
      setLoading(true);
      const response = await auditApi.getAll(filters);
      
      setLogs(response.data.data.logs);
      setPagination({
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages,
      });
    } catch (error: any) {
      console.error('Error al cargar logs de auditoría:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al cargar logs de auditoría';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogById = useCallback(async (id: string): Promise<AuditLogDetail | null> => {
    try {
      setLoading(true);
      const response = await auditApi.getById(id);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al cargar log de auditoría:', error);
      console.error('Error response:', error?.response);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al cargar log de auditoría';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await auditApi.getStats();
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      console.error('Error response:', error?.response);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al cargar estadísticas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logs,
    stats,
    loading,
    pagination,
    fetchLogs,
    fetchLogById,
    fetchStats,
  };
}
