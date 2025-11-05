import api from '../api';
import {
  SystemConfigResponse,
  UpdateGeneralConfigPayload,
} from '@/types/configuration.types';

export const configurationApi = {
  getConfig: () => {
    return api.get<SystemConfigResponse>('/configuration');
  },

  updateConfig: (data: UpdateGeneralConfigPayload) => {
    return api.put<SystemConfigResponse>('/configuration', data);
  },

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    return api.post<SystemConfigResponse>('/configuration/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadFavicon: (file: File) => {
    const formData = new FormData();
    formData.append('favicon', file);

    return api.post<SystemConfigResponse>('/configuration/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadStamp: (file: File) => {
    const formData = new FormData();
    formData.append('stamp', file);

    return api.post<SystemConfigResponse>('/configuration/stamp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadLoginBackground: (file: File, slot: string) => {
    const formData = new FormData();
    formData.append('loginBg', file);

    return api.post<SystemConfigResponse>(`/configuration/login-background/${slot}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteLogo: () => {
    return api.delete<SystemConfigResponse>('/configuration/logo');
  },

  deleteFavicon: () => {
    return api.delete<SystemConfigResponse>('/configuration/favicon');
  },

  deleteStamp: () => {
    return api.delete<SystemConfigResponse>('/configuration/stamp');
  },

  deleteLoginBackground: (slot: string) => {
    return api.delete<SystemConfigResponse>(`/configuration/login-background/${slot}`);
  },
};
