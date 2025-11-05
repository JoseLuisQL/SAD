import { useState, useCallback } from 'react';
import { archivadoresApi } from '@/lib/api/archivadores';
import { 
  Archivador, 
  ArchivadorWithDocuments,
  CreateArchivadorData, 
  UpdateArchivadorData,
  ArchivadoresFilters
} from '@/types/archivador.types';
import { toast } from 'sonner';

export function useArchivadores() {
  const [archivadores, setArchivadores] = useState<Archivador[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchArchivadores = useCallback(async (filters: ArchivadoresFilters = {}) => {
    try {
      setLoading(true);
      const response = await archivadoresApi.getAll(filters);
      
      setArchivadores(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: unknown) {
      console.error('Error al cargar archivadores:', error);
      toast.error('Error al cargar archivadores');
    } finally {
      setLoading(false);
    }
  }, []);

  const getArchivadorById = useCallback(async (id: string): Promise<ArchivadorWithDocuments | null> => {
    try {
      const response = await archivadoresApi.getById(id);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al cargar archivador:', error);
      toast.error('Error al cargar archivador');
      return null;
    }
  }, []);

  const createArchivador = useCallback(async (data: CreateArchivadorData) => {
    try {
      const response = await archivadoresApi.create(data);
      
      toast.success('Archivador creado exitosamente');
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al crear archivador';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateArchivador = useCallback(async (id: string, data: UpdateArchivadorData) => {
    try {
      const response = await archivadoresApi.update(id, data);
      
      toast.success('Archivador actualizado exitosamente');
      
      setArchivadores((prev) =>
        prev.map((archivador) => (archivador.id === id ? response.data.data : archivador))
      );
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al actualizar archivador';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteArchivador = useCallback(async (id: string) => {
    try {
      await archivadoresApi.delete(id);
      
      toast.success('Archivador eliminado exitosamente');
      
      setArchivadores((prev) => prev.filter((archivador) => archivador.id !== id));
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar archivador';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const searchArchivadores = useCallback(async (query: string) => {
    try {
      const response = await archivadoresApi.search(query);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al buscar archivadores:', error);
      toast.error('Error al buscar archivadores');
      return [];
    }
  }, []);

  return {
    archivadores,
    loading,
    pagination,
    fetchArchivadores,
    getArchivadorById,
    createArchivador,
    updateArchivador,
    deleteArchivador,
    searchArchivadores,
  };
}
