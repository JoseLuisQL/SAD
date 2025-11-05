import api from '../api';
import { 
  UsersResponse, 
  UserResponse, 
  CreateUserData, 
  UpdateUserData,
  UsersFilters 
} from '@/types/user.types';

export const usersApi = {
  getAll: (params: UsersFilters = {}) => {
    return api.get<UsersResponse>('/users', { params });
  },

  getById: (id: string) => {
    return api.get<UserResponse>(`/users/${id}`);
  },

  create: (data: CreateUserData) => {
    return api.post<UserResponse>('/users', data);
  },

  update: (id: string, data: UpdateUserData) => {
    return api.put<UserResponse>(`/users/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete(`/users/${id}`);
  },

  search: (query: string) => {
    return api.get<{ status: string; message: string; data: UserResponse[] }>('/users/search', { 
      params: { q: query } 
    });
  },

  getStats: () => {
    return api.get<{
      status: string;
      message: string;
      data: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        usersByRole: Array<{ roleId: string; roleName: string; count: number }>;
        recentUsers: UserResponse[];
      };
    }>('/users/stats');
  },

  exportCSV: (params: UsersFilters = {}) => {
    return api.get('/users/export/csv', {
      params,
      responseType: 'blob',
    });
  },

  exportExcel: (params: UsersFilters = {}) => {
    return api.get('/users/export/excel', {
      params,
      responseType: 'blob',
    });
  },

  getProfile: () => {
    return api.get<{
      status: string;
      message: string;
      data: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        role: {
          id: string;
          name: string;
          description: string;
          permissions: any;
        };
        _count: {
          documents: number;
          archivadores: number;
          signatures: number;
        };
      };
    }>('/users/profile');
  },

  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) => {
    return api.put<{
      status: string;
      message: string;
      data: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        role: {
          id: string;
          name: string;
          description: string;
          permissions: any;
        };
      };
    }>('/users/profile', data);
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) => {
    return api.post<{
      status: string;
      message: string;
    }>('/users/profile/change-password', data);
  },
};
