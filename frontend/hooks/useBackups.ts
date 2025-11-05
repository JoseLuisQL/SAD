import { useState, useEffect, useCallback } from 'react';
import { backupsApi } from '@/lib/api/backups';
import { BackupJob, BackupSummary, BackupFilters } from '@/types/backup.types';
import { toast } from '@/lib/toast';

export const useBackups = (filters?: BackupFilters) => {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters?.page || 1);
  const [limit, setLimit] = useState(filters?.limit || 10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupsApi.getBackups({
        ...filters,
        page,
        limit
      });
      
      setBackups(response.data.data.backups);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar copias de seguridad';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const createBackup = async () => {
    try {
      const response = await backupsApi.createBackup();
      toast.success(response.data.message);
      fetchBackups();
      return response.data.data.backupJob;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear copia de seguridad';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getBackupById = async (id: string) => {
    try {
      const response = await backupsApi.getBackupById(id);
      return response.data.data.backup;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalles de la copia';
      toast.error(errorMessage);
      throw err;
    }
  };

  const refetch = () => {
    fetchBackups();
  };

  return {
    backups,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    setPage,
    setLimit,
    createBackup,
    getBackupById,
    refetch
  };
};

export const useBackupSummary = () => {
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backupsApi.getSummary();
      setSummary(response.data.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar resumen de copias';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = () => {
    fetchSummary();
  };

  return {
    summary,
    isLoading,
    error,
    refetch
  };
};
