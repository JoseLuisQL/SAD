import api from '../api';
import { 
  OfficesResponse, 
  OfficeResponse, 
  CreateOfficeData, 
  UpdateOfficeData,
  OfficesFilters,
  Office
} from '@/types/typologies.types';

export const officesApi = {
  getAll: (params: OfficesFilters = {}) => {
    return api.get<OfficesResponse>('/offices', { params });
  },

  getById: (id: string) => {
    return api.get<OfficeResponse>(`/offices/${id}`);
  },

  create: (data: CreateOfficeData) => {
    return api.post<OfficeResponse>('/offices', data);
  },

  update: (id: string, data: UpdateOfficeData) => {
    return api.put<OfficeResponse>(`/offices/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/offices/${id}`);
  },

  search: (query: string) => {
    return api.get<{ status: string; message: string; data: Office[] }>('/offices/search', { 
      params: { q: query } 
    });
  },

  getStats: () => {
    return api.get<{ status: string; message: string; data: { total: number; active: number; inactive: number; mostUsed: Office[]; recentlyCreated: Office[] } }>('/offices/stats');
  },

  exportCSV: (params: OfficesFilters = {}) => {
    return api.get('/offices/export/csv', { params, responseType: 'blob' });
  },

  exportExcel: (params: OfficesFilters = {}) => {
    return api.get<{ status: string; message: string; data: any[] }>('/offices/export/excel', { params });
  },

  importCSV: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/offices/import/csv', { data });
  },

  importExcel: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/offices/import/excel', { data });
  },

  bulk: (operation: 'create' | 'update' | 'delete', data: any) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/offices/bulk', { operation, data });
  },
};
