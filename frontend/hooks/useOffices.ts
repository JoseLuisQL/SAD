import { useState, useCallback } from 'react';
import { officesApi } from '@/lib/api/offices';
import { Office, CreateOfficeData, UpdateOfficeData, OfficesFilters } from '@/types/typologies.types';
import { toast } from 'sonner';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useOffices() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOffices = useCallback(async (filters: OfficesFilters = {}) => {
    try {
      setLoading(true);
      const response = await officesApi.getAll(filters);
      
      setOffices(response.data.data.offices);
      setPagination({
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages,
      });
    } catch (error: unknown) {
      console.error('Error al cargar oficinas:', error);
      toast.error('Error al cargar oficinas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOffice = useCallback(async (data: CreateOfficeData) => {
    try {
      const response = await officesApi.create(data);
      
      toast.success('Oficina creada exitosamente');
      
      await fetchOffices({ page: 1, limit: pagination.limit });
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al crear oficina';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchOffices, pagination.limit]);

  const updateOffice = useCallback(async (id: string, data: UpdateOfficeData) => {
    try {
      const response = await officesApi.update(id, data);
      
      toast.success('Oficina actualizada exitosamente');
      
      setOffices((prev) =>
        prev.map((office) => (office.id === id ? response.data.data : office))
      );
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al actualizar oficina';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteOffice = useCallback(async (id: string) => {
    try {
      await officesApi.delete(id);
      
      toast.success('Oficina eliminada exitosamente');
      
      setOffices((prev) => prev.filter((office) => office.id !== id));
      
      if (offices.length - 1 === 0 && pagination.page > 1) {
        await fetchOffices({ page: pagination.page - 1, limit: pagination.limit });
      } else {
        await fetchOffices({ page: pagination.page, limit: pagination.limit });
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar oficina';
      toast.error(errorMessage);
      throw error;
    }
  }, [offices.length, pagination.page, pagination.limit, fetchOffices]);

  return {
    offices,
    loading,
    pagination,
    fetchOffices,
    createOffice,
    updateOffice,
    deleteOffice,
  };
}
