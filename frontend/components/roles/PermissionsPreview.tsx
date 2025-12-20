'use client';

import { Role } from '@/types/user.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PERMISSION_MODULES, ACTION_LABELS } from '@/lib/permissions';
import { Shield, Check } from 'lucide-react';

interface PermissionsPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function PermissionsPreview({ isOpen, onClose, role }: PermissionsPreviewProps) {
  if (!role) return null;

  const rolePermissions = role.permissions || {};
  
  const getTotalPermissionsCount = (): number => {
    let count = 0;
    Object.values(rolePermissions).forEach((modulePerms: unknown) => {
      if (typeof modulePerms === 'object' && modulePerms !== null) {
        count += Object.values(modulePerms as Record<string, boolean>).filter(v => v === true).length;
      }
    });
    return count;
  };

  const groupedPermissions = Object.entries(PERMISSION_MODULES)
    .map(([moduleKey, module]) => {
      const modulePerms = rolePermissions[moduleKey] || {};
      const activeActions = module.actions.filter(action => modulePerms[action] === true);

      return {
        moduleKey,
        label: module.label,
        category: module.category,
        actions: activeActions,
        totalActions: module.actions.length,
      };
    })
    .filter(module => module.actions.length > 0);

  // Agrupar por categoria
  const groupedByCategory = groupedPermissions.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof groupedPermissions>);

  const totalPermissions = getTotalPermissionsCount();
  const totalModules = groupedPermissions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            {role.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400">
            {role.description || 'Sin descripcion'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {groupedPermissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Shield className="h-6 w-6 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Este rol no tiene permisos asignados</p>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  <span className="font-medium text-gray-900 dark:text-white">{totalPermissions}</span> permisos
                </span>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <span className="text-gray-600 dark:text-slate-400">
                  <span className="font-medium text-gray-900 dark:text-white">{totalModules}</span> modulos
                </span>
              </div>

              {/* Permisos agrupados por categoria */}
              <div className="space-y-4">
                {Object.entries(groupedByCategory).map(([category, modules]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {modules.map(module => (
                        <div 
                          key={module.moduleKey} 
                          className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {module.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {module.actions.length} de {module.totalActions}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {module.actions.map(action => (
                              <span 
                                key={action}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 
                                           text-green-700 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800"
                              >
                                <Check className="h-3 w-3" />
                                {ACTION_LABELS[action] || action}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
