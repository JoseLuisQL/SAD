import { useState, useCallback } from 'react';
import { documentTypesApi } from '@/lib/api/document-types';
import { DocumentType, CreateDocumentTypeData, UpdateDocumentTypeData, DocumentTypesFilters } from '@/types/typologies.types';
import { toast } from 'sonner';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useDocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchDocumentTypes = useCallback(async (filters: DocumentTypesFilters = {}) => {
    try {
      setLoading(true);
      const response = await documentTypesApi.getAll(filters);
      
      setDocumentTypes(response.data.data.documentTypes);
      setPagination({
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages,
      });
    } catch (error: unknown) {
      console.error('Error al cargar tipos de documentos:', error);
      toast.error('Error al cargar tipos de documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocumentType = useCallback(async (data: CreateDocumentTypeData) => {
    try {
      const response = await documentTypesApi.create(data);
      
      toast.success('Tipo de documento creado exitosamente');
      
      await fetchDocumentTypes({ page: 1, limit: pagination.limit });
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al crear tipo de documento';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchDocumentTypes, pagination.limit]);

  const updateDocumentType = useCallback(async (id: string, data: UpdateDocumentTypeData) => {
    try {
      const response = await documentTypesApi.update(id, data);
      
      toast.success('Tipo de documento actualizado exitosamente');
      
      setDocumentTypes((prev) =>
        prev.map((documentType) => (documentType.id === id ? response.data.data : documentType))
      );
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al actualizar tipo de documento';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteDocumentType = useCallback(async (id: string) => {
    try {
      await documentTypesApi.delete(id);
      
      toast.success('Tipo de documento eliminado exitosamente');
      
      setDocumentTypes((prev) => prev.filter((documentType) => documentType.id !== id));
      
      if (documentTypes.length - 1 === 0 && pagination.page > 1) {
        await fetchDocumentTypes({ page: pagination.page - 1, limit: pagination.limit });
      } else {
        await fetchDocumentTypes({ page: pagination.page, limit: pagination.limit });
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar tipo de documento';
      toast.error(errorMessage);
      throw error;
    }
  }, [documentTypes.length, pagination.page, pagination.limit, fetchDocumentTypes]);

  return {
    documentTypes,
    loading,
    pagination,
    fetchDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
  };
}
