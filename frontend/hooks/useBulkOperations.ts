import { useState, useCallback } from 'react';
import { officesApi } from '@/lib/api/offices';
import { documentTypesApi } from '@/lib/api/document-types';
import { periodsApi } from '@/lib/api/periods';
import { toast } from 'sonner';

type TypologyType = 'office' | 'documentType' | 'period';
type BulkOperation = 'delete' | 'activate' | 'deactivate';

export function useBulkOperations(type: TypologyType) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getApi = () => {
    switch (type) {
      case 'office':
        return officesApi;
      case 'documentType':
        return documentTypesApi;
      case 'period':
        return periodsApi;
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selected.includes(id);
  }, [selected]);

  const toggleSelectAll = useCallback((allIds: string[]) => {
    if (selected.length === allIds.length) {
      clearSelection();
    } else {
      selectAll(allIds);
    }
  }, [selected.length, clearSelection, selectAll]);

  const bulkDelete = useCallback(async () => {
    if (selected.length === 0) {
      toast.error('No hay elementos seleccionados');
      return { success: [], errors: [] };
    }

    try {
      setIsProcessing(true);
      const api = getApi();
      
      const response = await api.bulk('delete', { ids: selected });
      const result = response.data.data;

      if (result.success.length > 0) {
        toast.success(`${result.success.length} elementos eliminados correctamente`);
      }

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} elementos no se pudieron eliminar`);
      }

      clearSelection();
      return result;
    } catch (error) {
      console.error('Error en operación masiva de eliminación:', error);
      toast.error('Error al eliminar elementos');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [selected, clearSelection]);

  const bulkUpdate = useCallback(async (updateData: any) => {
    if (selected.length === 0) {
      toast.error('No hay elementos seleccionados');
      return { success: [], errors: [] };
    }

    try {
      setIsProcessing(true);
      const api = getApi();
      
      const response = await api.bulk('update', {
        ids: selected,
        data: updateData,
      });
      const result = response.data.data;

      if (result.success.length > 0) {
        toast.success(`${result.success.length} elementos actualizados correctamente`);
      }

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} elementos no se pudieron actualizar`);
      }

      clearSelection();
      return result;
    } catch (error) {
      console.error('Error en operación masiva de actualización:', error);
      toast.error('Error al actualizar elementos');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [selected, clearSelection]);

  const bulkActivate = useCallback(async () => {
    return await bulkUpdate({ isActive: true });
  }, [bulkUpdate]);

  const bulkDeactivate = useCallback(async () => {
    return await bulkUpdate({ isActive: false });
  }, [bulkUpdate]);

  return {
    selected,
    isProcessing,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    toggleSelectAll,
    bulkDelete,
    bulkUpdate,
    bulkActivate,
    bulkDeactivate,
  };
}
