import { useState, useCallback } from 'react';
import { expedientesApi } from '@/lib/api/expedientes';
import {
  Expediente,
  ExpedienteFormData,
  ExpedientesFilters,
  ExpedientesResponse,
  ExpedienteResponse,
} from '@/types/expediente.types';
import { toast } from 'sonner';

export function useExpedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchExpedientes = useCallback(async (filters: ExpedientesFilters = {}) => {
    try {
      setLoading(true);
      const response = await expedientesApi.getAll(filters);

      if (!response || !response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      const responseData = response.data as ExpedientesResponse;

      if (!responseData.data) {
        throw new Error('Formato de respuesta inválido');
      }

      setExpedientes(responseData.data);
      setPagination(responseData.pagination);
    } catch (error: unknown) {
      console.error('Error al cargar expedientes:', error);

      let errorMessage = 'Error al cargar expedientes';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as { message?: string; status?: number };
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.status) {
          errorMessage = `Error del servidor (${apiError.status})`;
        }
      }

      toast.error(errorMessage);
      setExpedientes([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const getExpedienteById = useCallback(
    async (id: string): Promise<Expediente | null> => {
      try {
        setLoading(true);
        const response = await expedientesApi.getById(id);
        return (response.data as ExpedienteResponse).data;
      } catch (error: unknown) {
        console.error('Error al cargar expediente:', error);
        toast.error('Error al cargar expediente');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createExpediente = useCallback(async (data: ExpedienteFormData) => {
    try {
      setLoading(true);
      const response = await expedientesApi.create(data);

      toast.success('Expediente creado exitosamente');

      const newExpediente = (response.data as ExpedienteResponse).data;
      setExpedientes((prev) => [newExpediente, ...prev]);

      return newExpediente;
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Error al crear expediente';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpediente = useCallback(
    async (id: string, data: Partial<ExpedienteFormData>) => {
      try {
        setLoading(true);
        const response = await expedientesApi.update(id, data);

        toast.success('Expediente actualizado exitosamente');

        const updatedExpediente = (response.data as ExpedienteResponse).data;
        setExpedientes((prev) =>
          prev.map((exp) => (exp.id === id ? updatedExpediente : exp))
        );

        return updatedExpediente;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message ||
          'Error al actualizar expediente';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteExpediente = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await expedientesApi.delete(id);

      toast.success('Expediente eliminado exitosamente');

      setExpedientes((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Error al eliminar expediente';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDocumentsToExpediente = useCallback(
    async (expedienteId: string, documentIds: string[]) => {
      try {
        setLoading(true);
        const response = await expedientesApi.addDocuments(
          expedienteId,
          documentIds
        );

        toast.success(
          `${documentIds.length} documento(s) agregado(s) al expediente`
        );

        return (response.data as ExpedienteResponse).data;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message ||
          'Error al agregar documentos al expediente';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeDocumentsFromExpediente = useCallback(
    async (expedienteId: string, documentIds: string[]) => {
      try {
        setLoading(true);
        const response = await expedientesApi.removeDocuments(
          expedienteId,
          documentIds
        );

        toast.success(
          `${documentIds.length} documento(s) removido(s) del expediente`
        );

        return (response.data as ExpedienteResponse).data;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message ||
          'Error al remover documentos del expediente';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchExpedientes = useCallback(async (query: string) => {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await expedientesApi.search(query);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al buscar expedientes:', error);
      return [];
    }
  }, []);

  return {
    expedientes,
    loading,
    pagination,
    fetchExpedientes,
    getExpedienteById,
    createExpediente,
    updateExpediente,
    deleteExpediente,
    addDocumentsToExpediente,
    removeDocumentsFromExpediente,
    searchExpedientes,
  };
}
