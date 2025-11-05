import api from '../api';
import { 
  RolesResponse,
  RoleResponse,
  PermissionsResponse,
  CreateRoleData,
  UpdateRoleData
} from '@/types/user.types';

export const rolesApi = {
  getAll: () => {
    return api.get<RolesResponse>('/roles');
  },

  getById: (id: string) => {
    return api.get<RoleResponse>(`/roles/${id}`);
  },

  create: (data: CreateRoleData) => {
    return api.post<RoleResponse>('/roles', data);
  },

  update: (id: string, data: UpdateRoleData) => {
    return api.put<RoleResponse>(`/roles/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/roles/${id}`);
  },

  getPermissions: () => {
    return api.get<PermissionsResponse>('/roles/permissions');
  },

  getAnalytics: () => {
    return api.get<any>('/roles/analytics/summary');
  },

  getImpact: (id: string) => {
    return api.get<any>(`/roles/${id}/impact`);
  },

  duplicate: (id: string, name: string) => {
    return api.post<RoleResponse>(`/roles/${id}/duplicate`, { name });
  },
};
