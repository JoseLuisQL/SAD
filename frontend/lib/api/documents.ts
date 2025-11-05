import api from '../api';
import {
  DocumentsResponse,
  DocumentResponse,
  DocumentUploadResponse,
  DocumentsFilters,
  DocumentMetadata,
  UpdateDocumentData,
  DocumentIngestStatsResponse,
  DocumentAnalyticsResponse,
  DocumentAnalyticsFilters,
  DocumentTimelineResponse,
} from '@/types/document.types';

export const documentsApi = {
  upload: (file: File, metadata: DocumentMetadata) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return api.post<DocumentUploadResponse>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadBatch: (
    files: File[],
    commonMetadata: Partial<DocumentMetadata>,
    specificMetadata: Array<Partial<DocumentMetadata>>
  ) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Agregar metadatos comunes como campos individuales
    if (commonMetadata.archivadorId) {
      formData.append('archivadorId', commonMetadata.archivadorId);
    }
    if (commonMetadata.documentTypeId) {
      formData.append('documentTypeId', commonMetadata.documentTypeId);
    }
    if (commonMetadata.officeId) {
      formData.append('officeId', commonMetadata.officeId);
    }
    
    // Agregar metadatos específicos como JSON
    formData.append('specificMetadata', JSON.stringify(specificMetadata));

    return api.post('/documents/upload-batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAll: (params: DocumentsFilters = {}) => {
    return api.get<DocumentsResponse>('/documents', { params });
  },

  getById: (id: string) => {
    return api.get<DocumentResponse>(`/documents/${id}`);
  },

  download: (id: string) => {
    return api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
  },

  update: (id: string, data: UpdateDocumentData) => {
    return api.put<DocumentResponse>(`/documents/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/documents/${id}`);
  },

  getVersions: (id: string) => {
    return api.get(`/documents/${id}/versions`);
  },

  downloadVersion: (documentId: string, versionId: string) => {
    return api.get(`/documents/${documentId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
  },

  getIngestStats: () => {
    return api.get<DocumentIngestStatsResponse>('/documents/stats/ingest');
  },

  getAnalytics: (filters?: DocumentAnalyticsFilters) => {
    return api.get<DocumentAnalyticsResponse>('/documents/analytics', { params: filters });
  },

  getTimeline: (id: string) => {
    return api.get<DocumentTimelineResponse>(`/documents/${id}/timeline`);
  },
};
