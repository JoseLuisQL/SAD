import api from '../api';
import { 
  PeriodsResponse, 
  PeriodResponse, 
  CreatePeriodData, 
  UpdatePeriodData
} from '@/types/typologies.types';

import { Period } from '@/types/typologies.types';

export const periodsApi = {
  getAll: () => {
    return api.get<PeriodsResponse>('/periods');
  },

  getById: (id: string) => {
    return api.get<PeriodResponse>(`/periods/${id}`);
  },

  create: (data: CreatePeriodData) => {
    return api.post<PeriodResponse>('/periods', data);
  },

  update: (id: string, data: UpdatePeriodData) => {
    return api.put<PeriodResponse>(`/periods/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/periods/${id}`);
  },

  getStats: () => {
    return api.get<{ status: string; message: string; data: { total: number; active: number; inactive: number; mostUsed: Period[]; recentlyCreated: Period[] } }>('/periods/stats');
  },

  exportCSV: () => {
    return api.get('/periods/export/csv', { responseType: 'blob' });
  },

  exportExcel: () => {
    return api.get<{ status: string; message: string; data: any[] }>('/periods/export/excel');
  },

  importCSV: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/periods/import/csv', { data });
  },

  importExcel: (data: any[]) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/periods/import/excel', { data });
  },

  bulk: (operation: 'create' | 'update' | 'delete', data: any) => {
    return api.post<{ status: string; message: string; data: { success: any[]; errors: any[] } }>('/periods/bulk', { operation, data });
  },
};
