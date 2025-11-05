import { useState, useCallback } from 'react';
import { usersApi } from '@/lib/api/users';
import { User, CreateUserData, UpdateUserData, UsersFilters } from '@/types/user.types';
import { toast } from 'sonner';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{ roleId: string; roleName: string; count: number }>;
  recentUsers: User[];
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async (filters: UsersFilters = {}) => {
    try {
      setLoading(true);
      const response = await usersApi.getAll(filters);
      
      setUsers(response.data.data.users);
      setPagination({
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages,
      });
    } catch (error: unknown) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserData) => {
    try {
      const response = await usersApi.create(data);
      
      toast.success('Usuario creado exitosamente');
      
      await fetchUsers({ page: 1, limit: pagination.limit });
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al crear usuario';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchUsers, pagination.limit]);

  const updateUser = useCallback(async (id: string, data: UpdateUserData) => {
    try {
      const response = await usersApi.update(id, data);
      
      toast.success('Usuario actualizado exitosamente');
      
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? response.data.data : user))
      );
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al actualizar usuario';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await usersApi.delete(id);
      
      toast.success('Usuario eliminado exitosamente');
      
      setUsers((prev) => prev.filter((user) => user.id !== id));
      
      if (users.length - 1 === 0 && pagination.page > 1) {
        await fetchUsers({ page: pagination.page - 1, limit: pagination.limit });
      } else {
        await fetchUsers({ page: pagination.page, limit: pagination.limit });
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar usuario';
      toast.error(errorMessage);
      throw error;
    }
  }, [users.length, pagination.page, pagination.limit, fetchUsers]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await usersApi.getStats();
      setStats(response.data.data);
    } catch (error: unknown) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    }
  }, []);

  const exportUsers = useCallback(async (format: 'csv' | 'excel', filters?: UsersFilters) => {
    try {
      const response = format === 'csv' 
        ? await usersApi.exportCSV(filters)
        : await usersApi.exportExcel(filters);

      const blob = new Blob([response.data], {
        type: format === 'csv' 
          ? 'text/csv' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Usuarios exportados a ${format.toUpperCase()} correctamente`);
    } catch (error: unknown) {
      console.error('Error al exportar usuarios:', error);
      toast.error('Error al exportar usuarios');
      throw error;
    }
  }, []);

  return {
    users,
    stats,
    loading,
    pagination,
    fetchUsers,
    fetchStats,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
  };
}
