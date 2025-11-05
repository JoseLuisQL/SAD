'use client';

import { useEffect, useState, useMemo } from 'react';
import { getModulesByCategory } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, CheckSquare, Square, Zap } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';

interface PermissionsEditorProps {
  selectedPermissions: Record<string, any>;
  onChange: (permissions: Record<string, any>) => void;
}

const PERMISSION_TEMPLATES = {
  readonly: {
    label: 'Solo Lectura',
    description: 'Permisos de visualización únicamente',
    icon: <Square className="h-4 w-4" />,
    permissions: ['view', 'download']
  },
  standard: {
    label: 'Usuario Estándar',
    description: 'Lectura y edición básica',
    icon: <CheckSquare className="h-4 w-4" />,
    permissions: ['view', 'create', 'update', 'download']
  },
  advanced: {
    label: 'Usuario Avanzado',
    description: 'Todos los permisos excepto delete críticos',
    icon: <Zap className="h-4 w-4" />,
    permissions: ['view', 'create', 'update', 'download', 'export', 'generate', 'sign', 'compare', 'restore']
  }
};

export default function PermissionsEditor({ selectedPermissions, onChange }: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Record<string, any>>(selectedPermissions || {});
  const [searchQuery, setSearchQuery] = useState('');
  const modulesByCategory = getModulesByCategory();

  useEffect(() => {
    setPermissions(selectedPermissions || {});
  }, [selectedPermissions]);

  const handlePermissionToggle = (module: string, action: string) => {
    const newPermissions = { ...permissions };
    
    if (!newPermissions[module]) {
      newPermissions[module] = {};
    }
    
    newPermissions[module] = {
      ...newPermissions[module],
      [action]: !newPermissions[module]?.[action]
    };
    
    const hasAnyPermission = Object.values(newPermissions[module]).some(v => v === true);
    if (!hasAnyPermission) {
      delete newPermissions[module];
    }
    
    setPermissions(newPermissions);
    onChange(newPermissions);
  };

  const handleModuleToggle = (module: string, actions: readonly string[]) => {
    const newPermissions = { ...permissions };
    const modulePerms = newPermissions[module] || {};
    const allSelected = actions.every(action => modulePerms[action] === true);
    
    if (allSelected) {
      delete newPermissions[module];
    } else {
      newPermissions[module] = {};
      actions.forEach(action => {
        newPermissions[module][action] = true;
      });
    }
    
    setPermissions(newPermissions);
    onChange(newPermissions);
  };

  const applyTemplate = (templateKey: keyof typeof PERMISSION_TEMPLATES) => {
    const template = PERMISSION_TEMPLATES[templateKey];
    const newPermissions: Record<string, any> = {};

    Object.entries(modulesByCategory).forEach(([, modules]) => {
      modules.forEach(module => {
        const applicableActions = module.actions.filter(action => 
          template.permissions.includes(action)
        );
        
        if (applicableActions.length > 0) {
          newPermissions[module.key] = {};
          applicableActions.forEach(action => {
            newPermissions[module.key][action] = true;
          });
        }
      });
    });

    setPermissions(newPermissions);
    onChange(newPermissions);
  };

  const filteredModulesByCategory = useMemo(() => {
    if (!searchQuery.trim()) return modulesByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: typeof modulesByCategory = {};

    Object.entries(modulesByCategory).forEach(([category, modules]) => {
      const filteredModules = modules.filter(module => 
        module.label.toLowerCase().includes(query) ||
        module.key.toLowerCase().includes(query)
      );

      if (filteredModules.length > 0) {
        filtered[category] = filteredModules;
      }
    });

    return filtered;
  }, [modulesByCategory, searchQuery]);

  const totalSelectedPermissions = useMemo(() => {
    let count = 0;
    Object.values(permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
      }
    });
    return count;
  }, [permissions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
          />
        </div>
        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium whitespace-nowrap">
          {totalSelectedPermissions} permisos seleccionados
        </Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(PERMISSION_TEMPLATES).map(([key, template]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => applyTemplate(key as keyof typeof PERMISSION_TEMPLATES)}
            className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            {template.icon}
            <span className="ml-2">{template.label}</span>
          </Button>
        ))}
      </div>

      <Tabs defaultValue={Object.keys(filteredModulesByCategory)[0]} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-1">
          {Object.keys(filteredModulesByCategory).map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(filteredModulesByCategory).map(([category, modules]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {modules.map((module) => {
              const modulePerms = permissions[module.key] || {};

              return (
                <PermissionModuleCard
                  key={module.key}
                  moduleKey={module.key}
                  moduleLabel={module.label}
                  actions={module.actions}
                  selectedPermissions={modulePerms}
                  onPermissionToggle={(action) => handlePermissionToggle(module.key, action)}
                  onModuleToggle={() => handleModuleToggle(module.key, module.actions)}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
