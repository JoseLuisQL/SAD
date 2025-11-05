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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Object.values(rolePermissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-gray-900 dark:text-white" />
            Permisos de {role.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400">
            {role.description || 'Sin descripción'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {groupedPermissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500 opacity-50" />
              <p className="text-gray-600 dark:text-slate-400 font-medium">Este rol no tiene permisos asignados</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                    Total de permisos: <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium">{getTotalPermissionsCount()}</Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                    Módulos con acceso: <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium">{groupedPermissions.length}</Badge>
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {groupedPermissions.map(module => (
                  <Card key={module.moduleKey} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between text-gray-900 dark:text-white">
                        <span>{module.label}</span>
                        <Badge variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium">
                          {module.actions.length}/{module.totalActions} permisos
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {module.actions.map(action => (
                          <div key={action} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{ACTION_LABELS[action] || action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
