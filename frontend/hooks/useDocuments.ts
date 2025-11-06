import { useState, useCallback } from 'react';
import { documentsApi } from '@/lib/api/documents';
import {
  Document,
  DocumentMetadata,
  DocumentsFilters,
  UpdateDocumentData,
  DocumentsResponse,
  DocumentResponse,
  DocumentUploadResponse,
} from '@/types/document.types';
import { toast } from 'sonner';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchDocuments = useCallback(async (filters: DocumentsFilters = {}) => {
    try {
      setLoading(true);
      const response = await documentsApi.getAll(filters);

      if (!response || !response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      const responseData = response.data as DocumentsResponse;
      
      if (!responseData.data) {
        throw new Error('Formato de respuesta inválido');
      }

      setDocuments(responseData.data);
      setPagination(responseData.pagination);
    } catch (error: unknown) {
      console.error('Error al cargar documentos:', error);
      
      let errorMessage = 'Error al cargar documentos';
      
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
      setDocuments([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentById = useCallback(async (id: string): Promise<Document | null> => {
    try {
      const response = await documentsApi.getById(id);
      return (response.data as DocumentResponse).data;
    } catch (error: unknown) {
      console.error('Error al cargar documento:', error);
      toast.error('Error al cargar documento');
      return null;
    }
  }, []);

  const uploadDocument = useCallback(
    async (file: File, metadata: DocumentMetadata) => {
      try {
        setLoading(true);
        setUploadProgress(0);

        const response = await documentsApi.upload(file, metadata);

        setUploadProgress(100);
        toast.success('Documento subido exitosamente');

        return (response.data as DocumentUploadResponse).data;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message || 'Error al subir documento';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    []
  );

  const uploadBatch = useCallback(
    async (
      files: File[],
      commonMetadata: Partial<DocumentMetadata>,
      specificMetadata: Array<Partial<DocumentMetadata>>
    ) => {
      try {
        setLoading(true);
        setUploadProgress(0);

        const response = await documentsApi.uploadBatch(
          files,
          commonMetadata,
          specificMetadata
        );

        setUploadProgress(100);
        toast.success('Carga masiva completada');

        return response.data;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message || 'Error en la carga masiva';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    []
  );

  const updateDocument = useCallback(
    async (id: string, data: UpdateDocumentData) => {
      try {
        const response = await documentsApi.update(id, data);

        toast.success('Documento actualizado exitosamente');

        const updatedDoc = (response.data as DocumentResponse).data;
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? updatedDoc : doc))
        );

        return updatedDoc;
      } catch (error: unknown) {
        const errorMessage =
          (error as { message?: string })?.message || 'Error al actualizar documento';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await documentsApi.delete(id);

      toast.success('Documento eliminado exitosamente');

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Error al eliminar documento';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const downloadDocument = useCallback(async (id: string, fileName: string) => {
    try {
      const response = await documentsApi.download(id);

      const blob = response.data as unknown as Blob;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);

      // Safely append, click, and remove
      if (document.body) {
        document.body.appendChild(link);
        link.click();

        // Use setTimeout to ensure click completes before removal
        setTimeout(() => {
          try {
            if (link.parentNode && document.contains(link)) {
              link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.debug('Download cleanup skipped:', cleanupError);
          }
        }, 100);
      }

      toast.success('Documento descargado');
    } catch (error: unknown) {
      console.error('Error al descargar documento:', error);
      toast.error('Error al descargar documento');
    }
  }, []);

  return {
    documents,
    loading,
    uploadProgress,
    pagination,
    fetchDocuments,
    getDocumentById,
    uploadDocument,
    uploadBatch,
    updateDocument,
    deleteDocument,
    downloadDocument,
  };
}
