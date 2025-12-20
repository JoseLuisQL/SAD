'use client';

import { useState } from 'react';
import { Role } from '@/types/user.types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getModulesByCategory, ACTION_LABELS } from '@/lib/permissions';
import { Check, X, ArrowLeftRight, Shield } from 'lucide-react';

interface RolesComparisonProps {
  roles: Role[];
}

export default function RolesComparison({ roles }: RolesComparisonProps) {
  const [role1Id, setRole1Id] = useState<string>('');
  const [role2Id, setRole2Id] = useState<string>('');

  const modulesByCategory = getModulesByCategory();

  const role1 = roles.find(r => r.id === role1Id);
  const role2 = roles.find(r => r.id === role2Id);

  const getPermissionsCount = (role: Role): number => {
    if (!role.permissions || typeof role.permissions !== 'object') return 0;
    
    let count = 0;
    Object.values(role.permissions).forEach((modulePerms: unknown) => {
      if (typeof modulePerms === 'object' && modulePerms !== null) {
        count += Object.values(modulePerms as Record<string, boolean>).filter(v => v === true).length;
      }
    });
    return count;
  };

  const hasPermission = (role: Role | undefined, module: string, action: string): boolean => {
    if (!role || !role.permissions || typeof role.permissions !== 'object') return false;
    const modulePerms = role.permissions[module];
    if (!modulePerms || typeof modulePerms !== 'object') return false;
    return modulePerms[action] === true;
  };

  const isDifferent = (module: string, action: string): boolean => {
    return hasPermission(role1, module, action) !== hasPermission(role2, module, action);
  };

  return (
    <div className="space-y-6">
      {/* Selectores lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
            Primer Rol
          </label>
          <Select value={role1Id} onValueChange={setRole1Id}>
            <SelectTrigger className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id} className="dark:hover:bg-slate-700 dark:text-slate-200">
                  <span className="flex items-center justify-between gap-2 w-full">
                    {role.name}
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      ({getPermissionsCount(role)} permisos)
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {role1 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {role1.description || 'Sin descripcion'} - <span className="font-medium">{getPermissionsCount(role1)} permisos</span>
            </p>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
            Segundo Rol
          </label>
          <Select value={role2Id} onValueChange={setRole2Id}>
            <SelectTrigger className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id} className="dark:hover:bg-slate-700 dark:text-slate-200">
                  <span className="flex items-center justify-between gap-2 w-full">
                    {role.name}
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      ({getPermissionsCount(role)} permisos)
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {role2 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {role2.description || 'Sin descripcion'} - <span className="font-medium">{getPermissionsCount(role2)} permisos</span>
            </p>
          )}
        </div>
      </div>

      {role1 && role2 ? (
        <div className="space-y-4">
          {Object.entries(modulesByCategory).map(([category, modules]) => {
            const relevantModules = modules.filter(module => {
              const role1HasModule = role1.permissions && role1.permissions[module.key];
              const role2HasModule = role2.permissions && role2.permissions[module.key];
              return role1HasModule || role2HasModule;
            });

            if (relevantModules.length === 0) return null;

            return (
              <div key={category} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {category}
                </h3>
                <div className="space-y-3">
                  {relevantModules.map((module) => (
                    <div key={module.key} className="pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{module.label}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {module.actions.map((action) => {
                          const role1Has = hasPermission(role1, module.key, action);
                          const role2Has = hasPermission(role2, module.key, action);
                          const different = isDifferent(module.key, action);

                          return (
                            <div 
                              key={action} 
                              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                                different 
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                                  : 'bg-gray-50 dark:bg-slate-800/50'
                              }`}
                            >
                              <span className={`flex-1 ${different ? 'text-amber-900 dark:text-amber-200 font-medium' : 'text-gray-700 dark:text-slate-300'}`}>
                                {ACTION_LABELS[action] || action}
                              </span>
                              <div className="flex items-center gap-2">
                                {role1Has ? (
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <X className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600" />
                                )}
                                <span className="text-gray-300 dark:text-slate-600">|</span>
                                {role2Has ? (
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <X className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <ArrowLeftRight className="h-6 w-6 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Selecciona dos roles para comparar
          </p>
        </div>
      )}
    </div>
  );
}
