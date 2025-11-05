'use client';

import { useAuthStore } from '@/store/authStore';
import { useMemo } from 'react';

export type ModuleName = 
  | 'users'
  | 'roles'
  | 'offices'
  | 'documentTypes'
  | 'periods'
  | 'audit'
  | 'configuration'
  | 'archivadores'
  | 'documents'
  | 'versions'
  | 'expedientes'
  | 'search'
  | 'reports'
  | 'analytics'
  | 'signing'
  | 'signatureFlows'
  | 'notifications'
  | 'security';

export type PermissionAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'download'
  | 'export'
  | 'generate'
  | 'sign'
  | 'approve'
  | 'restore'
  | 'compare'
  | 'backup.view'
  | 'backup.manage'
  | 'backup.restore';

interface UsePermissionsReturn {
  hasPermission: (module: ModuleName, action: PermissionAction) => boolean;
  hasAnyPermission: (permissions: Array<{ module: ModuleName; action: PermissionAction }>) => boolean;
  hasAllPermissions: (permissions: Array<{ module: ModuleName; action: PermissionAction }>) => boolean;
  hasModule: (module: ModuleName) => boolean;
  isAdmin: boolean;
  permissions: Record<string, any> | null;
}

/**
 * Hook para verificar permisos del usuario autenticado
 * 
 * @example
 * const { hasPermission, hasModule } = usePermissions();
 * 
 * if (hasPermission('documents', 'create')) {
 *   // Mostrar botón de crear documento
 * }
 * 
 * if (hasModule('analytics')) {
 *   // Mostrar sección de analytics
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuthStore();

  const permissions = useMemo(() => {
    return user?.role?.permissions || null;
  }, [user]);

  const isAdmin = useMemo(() => {
    return user?.role?.name === 'Administrador';
  }, [user]);

  const hasPermission = useMemo(() => {
    return (module: ModuleName, action: PermissionAction): boolean => {
      if (!permissions || typeof permissions !== 'object') {
        return false;
      }

      const modulePerms = permissions[module];
      if (!modulePerms || typeof modulePerms !== 'object') {
        return false;
      }

      return modulePerms[action] === true;
    };
  }, [permissions]);

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: Array<{ module: ModuleName; action: PermissionAction }>): boolean => {
      return requiredPermissions.some(({ module, action }) => 
        hasPermission(module, action)
      );
    };
  }, [hasPermission]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Array<{ module: ModuleName; action: PermissionAction }>): boolean => {
      return requiredPermissions.every(({ module, action }) => 
        hasPermission(module, action)
      );
    };
  }, [hasPermission]);

  const hasModule = useMemo(() => {
    return (module: ModuleName): boolean => {
      if (!permissions || typeof permissions !== 'object') {
        return false;
      }

      const modulePerms = permissions[module];
      if (!modulePerms || typeof modulePerms !== 'object') {
        return false;
      }

      // Tiene el módulo si tiene al menos un permiso activo
      return Object.values(modulePerms).some(value => value === true);
    };
  }, [permissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModule,
    isAdmin,
    permissions
  };
}
