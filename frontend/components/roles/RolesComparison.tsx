'use client';

import { useState } from 'react';
import { Role } from '@/types/user.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getModulesByCategory, ACTION_LABELS } from '@/lib/permissions';
import { Check, X, AlertCircle } from 'lucide-react';

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
    Object.values(role.permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Primer Rol</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400 font-medium">Selecciona el primer rol a comparar</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={role1Id} onValueChange={setRole1Id}>
              <SelectTrigger className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id} className="dark:hover:bg-slate-700 dark:text-slate-200">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{role1.description || 'Sin descripción'}</p>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium">
                  {getPermissionsCount(role1)} permisos
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Segundo Rol</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400 font-medium">Selecciona el segundo rol a comparar</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={role2Id} onValueChange={setRole2Id}>
              <SelectTrigger className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id} className="dark:hover:bg-slate-700 dark:text-slate-200">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role2 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{role2.description || 'Sin descripción'}</p>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium">
                  {getPermissionsCount(role2)} permisos
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {role1 && role2 ? (
        <div className="space-y-4">
          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <Card key={category} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module) => {
                    const role1HasModule = role1.permissions && role1.permissions[module.key];
                    const role2HasModule = role2.permissions && role2.permissions[module.key];

                    if (!role1HasModule && !role2HasModule) return null;

                    return (
                      <div key={module.key} className="border-b last:border-0 pb-4 last:pb-0 border-gray-200 dark:border-slate-700">
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{module.label}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">{role1.name}</p>
                            <div className="space-y-1">
                              {module.actions.map((action) => {
                                const has = hasPermission(role1, module.key, action);
                                return (
                                  <div key={action} className="flex items-center gap-2 text-sm">
                                    {has ? (
                                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                                    )}
                                    <span className={has ? 'font-medium text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-500'}>
                                      {ACTION_LABELS[action] || action}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">{role2.name}</p>
                            <div className="space-y-1">
                              {module.actions.map((action) => {
                                const has = hasPermission(role2, module.key, action);
                                return (
                                  <div key={action} className="flex items-center gap-2 text-sm">
                                    {has ? (
                                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <X className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                                    )}
                                    <span className={has ? 'font-medium text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-500'}>
                                      {ACTION_LABELS[action] || action}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <p className="text-gray-600 dark:text-slate-400 font-medium">
                Selecciona dos roles para comparar sus permisos
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
