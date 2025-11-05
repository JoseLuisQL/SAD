import api from '../api';
import {
  ExpedientesResponse,
  ExpedienteResponse,
  ExpedientesFilters,
  ExpedienteFormData,
  AddRemoveDocumentsData,
  ExpedienteActivityResponse,
  ExpedienteMetricsResponse,
  ExpedienteAnalyticsResponse,
} from '@/types/expediente.types';

export const expedientesApi = {
  getAll: (params: ExpedientesFilters = {}) => {
    return api.get<ExpedientesResponse>('/expedientes', { params });
  },

  getById: (id: string) => {
    return api.get<ExpedienteResponse>(`/expedientes/${id}`);
  },

  create: (data: ExpedienteFormData) => {
    return api.post<ExpedienteResponse>('/expedientes', data);
  },

  update: (id: string, data: Partial<ExpedienteFormData>) => {
    return api.put<ExpedienteResponse>(`/expedientes/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/expedientes/${id}`);
  },

  addDocuments: (expedienteId: string, documentIds: string[]) => {
    const data: AddRemoveDocumentsData = { documentIds };
    return api.post<ExpedienteResponse>(
      `/expedientes/${expedienteId}/documents`,
      data
    );
  },

  removeDocuments: (expedienteId: string, documentIds: string[]) => {
    const data: AddRemoveDocumentsData = { documentIds };
    return api.delete(`/expedientes/${expedienteId}/documents`, { data });
  },

  search: (query: string) => {
    return api.get<{ status: string; message: string; data: ExpedientesResponse['data'] }>(
      `/expedientes/search`,
      { params: { q: query } }
    );
  },

  getStats: () => {
    return api.get<ExpedienteMetricsResponse>('/expedientes/stats');
  },

  getAnalytics: (expedienteId: string) => {
    return api.get<ExpedienteAnalyticsResponse>(`/expedientes/${expedienteId}/analytics`);
  },

  getActivity: (expedienteId: string, page: number = 1, limit: number = 20) => {
    return api.get<ExpedienteActivityResponse>(`/expedientes/${expedienteId}/activity`, {
      params: { page, limit }
    });
  },
};
