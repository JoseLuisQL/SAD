import { useState, useCallback } from 'react';
import { periodsApi } from '@/lib/api/periods';
import { Period, CreatePeriodData, UpdatePeriodData } from '@/types/typologies.types';
import { toast } from 'sonner';

export function usePeriods() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await periodsApi.getAll();
      
      setPeriods(response.data.data);
    } catch (error: unknown) {
      console.error('Error al cargar periodos:', error);
      toast.error('Error al cargar periodos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPeriod = useCallback(async (data: CreatePeriodData) => {
    try {
      const response = await periodsApi.create(data);
      
      toast.success('Periodo creado exitosamente');
      
      await fetchPeriods();
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al crear periodo';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchPeriods]);

  const updatePeriod = useCallback(async (id: string, data: UpdatePeriodData) => {
    try {
      const response = await periodsApi.update(id, data);
      
      toast.success('Periodo actualizado exitosamente');
      
      setPeriods((prev) =>
        prev.map((period) => (period.id === id ? response.data.data : period))
      );
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al actualizar periodo';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deletePeriod = useCallback(async (id: string) => {
    try {
      await periodsApi.delete(id);
      
      toast.success('Periodo eliminado exitosamente');
      
      await fetchPeriods();
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar periodo';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
}
