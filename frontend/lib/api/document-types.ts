import api from '../api';
import { 
  DocumentTypesResponse, 
  DocumentTypeResponse, 
  CreateDocumentTypeData, 
  UpdateDocumentTypeData,
  DocumentTypesFilters,
  DocumentType
} from '@/types/typologies.types';

export const documentTypesApi = {
  getAll: (params: DocumentTypesFilters = {}) => {
    return api.get<DocumentTypesResponse>('/document-types', { params });
  },

  getById: (id: string) => {
    return api.get<DocumentTypeResponse>(`/document-types/${id}`);
  },

  create: (data: CreateDocumentTypeData) => {
    return api.post<DocumentTypeResponse>('/document-types', data);
  },

  update: (id: string, data: UpdateDocumentTypeData) => {
    return api.put<DocumentTypeResponse>(`/document-types/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/document-types/${id}`);
  },

  search: (query: string) => {
    return api.get<{ status: string; message: string; data: DocumentType[] }>('/document-types/search', { 
      params: { q: query } 
    });
  },

  getStats: () => {
    return api.get<{ status: string; message: string; data: { total: number; active: number; inactive: number; mostUsed: DocumentType[]; recentlyCreated: DocumentType[] } }>('/document-types/stats');
  },

  exportCSV: (params: DocumentTypesFilters = {}) => {
    return api.get('/document-types/export/csv', { params, responseType: 'blob' });
  },

  exportExcel: (params: DocumentTypesFilters = {}) => {
    return api.get<{ status: string; message: string; data: any[] }>('/document-types/export/excel', { params });
  },

  importCSV: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/document-types/import/csv', { data });
  },

  importExcel: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/document-types/import/excel', { data });
  },

  bulk: (operation: 'create' | 'update' | 'delete', data: any) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/document-types/bulk', { operation, data });
  },
};
