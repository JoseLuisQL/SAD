import { useState, useCallback } from 'react';
import { rolesApi } from '@/lib/api/roles';
import { Role, Permission, CreateRoleData, UpdateRoleData } from '@/types/user.types';
import { toast } from 'sonner';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rolesApi.getAll();
      setRoles(response.data.data);
    } catch (error: unknown) {
      console.error('Error al cargar roles:', error);
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rolesApi.getPermissions();
      setPermissions(response.data.data);
    } catch (error: unknown) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data: CreateRoleData) => {
    try {
      const response = await rolesApi.create(data);
      toast.success('Rol creado exitosamente');
      await fetchRoles();
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear rol:', error);
      
      let errorMessage = 'Error al crear rol';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id: string, data: UpdateRoleData) => {
    try {
      const response = await rolesApi.update(id, data);
      toast.success('Rol actualizado exitosamente');
      setRoles((prev) =>
        prev.map((role) => (role.id === id ? response.data.data : role))
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      
      let errorMessage = 'Error al actualizar rol';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      await rolesApi.delete(id);
      toast.success('Rol eliminado exitosamente');
      setRoles((prev) => prev.filter((role) => role.id !== id));
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al eliminar rol';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await rolesApi.getAnalytics();
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al cargar analytics:', error);
      toast.error('Error al cargar analytics');
      throw error;
    }
  }, []);

  const fetchRoleImpact = useCallback(async (id: string) => {
    try {
      const response = await rolesApi.getImpact(id);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al cargar impacto del rol:', error);
      toast.error('Error al cargar impacto del rol');
      throw error;
    }
  }, []);

  const duplicateRole = useCallback(async (id: string, newName: string) => {
    try {
      const response = await rolesApi.duplicate(id, newName);
      toast.success('Rol duplicado exitosamente');
      await fetchRoles();
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Error al duplicar rol';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchRoles]);

  return {
    roles,
    permissions,
    loading,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    fetchAnalytics,
    fetchRoleImpact,
    duplicateRole,
  };
}
