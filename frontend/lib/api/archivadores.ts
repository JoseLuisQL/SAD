import api from '../api';
import { 
  ArchivadoresResponse, 
  ArchivadorResponse,
  ArchivadorStatsResponse,
  ArchivadorSearchResponse,
  ArchivadorGeneralStatsResponse,
  ArchivadorAnalyticsResponse,
  CreateArchivadorData, 
  UpdateArchivadorData,
  ArchivadoresFilters
} from '@/types/archivador.types';

export const archivadoresApi = {
  getAll: (params: ArchivadoresFilters = {}) => {
    return api.get<ArchivadoresResponse>('/archivadores', { params });
  },

  getById: (id: string) => {
    return api.get<ArchivadorResponse>(`/archivadores/${id}`);
  },

  getStats: (id: string) => {
    return api.get<ArchivadorStatsResponse>(`/archivadores/${id}/stats`);
  },

  getGeneralStats: () => {
    return api.get<ArchivadorGeneralStatsResponse>('/archivadores/stats');
  },

  getAnalytics: (id: string) => {
    return api.get<ArchivadorAnalyticsResponse>(`/archivadores/${id}/analytics`);
  },

  create: (data: CreateArchivadorData) => {
    return api.post<ArchivadorResponse>('/archivadores', data);
  },

  update: (id: string, data: UpdateArchivadorData) => {
    return api.put<ArchivadorResponse>(`/archivadores/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/archivadores/${id}`);
  },

  search: (query: string) => {
    return api.get<ArchivadorSearchResponse>('/archivadores/search', { 
      params: { q: query } 
    });
  },
};
