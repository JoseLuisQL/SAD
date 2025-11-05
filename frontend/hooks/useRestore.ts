import { useState, useEffect, useCallback } from 'react';
import { backupsApi } from '@/lib/api/backups';
import { RestoreLog, RestoreFilters } from '@/types/backup.types';
import { toast } from '@/lib/toast';

export const useRestore = (filters?: RestoreFilters) => {
  const [restores, setRestores] = useState<RestoreLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters?.page || 1);
  const [limit, setLimit] = useState(filters?.limit || 10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupsApi.getRestores({
        ...filters,
        page,
        limit
      });
      
      setRestores(response.data.data.restores);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar restauraciones';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const restoreBackup = async (backupId: string) => {
    try {
      const response = await backupsApi.restoreBackup(backupId);
      toast.success(response.data.message);
      fetchRestores();
      return response.data.data.restoreLog;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar restauración';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getRestoreById = async (id: string) => {
    try {
      const response = await backupsApi.getRestoreById(id);
      return response.data.data.restore;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalles de la restauración';
      toast.error(errorMessage);
      throw err;
    }
  };

  const refetch = () => {
    fetchRestores();
  };

  return {
    restores,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    setPage,
    setLimit,
    restoreBackup,
    getRestoreById,
    refetch
  };
};
