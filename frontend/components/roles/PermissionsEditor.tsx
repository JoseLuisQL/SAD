'use client';

import { useEffect, useState, useMemo } from 'react';
import { getModulesByCategory } from '@/lib/permissions';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Eye, Edit3, Zap } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';

interface PermissionsEditorProps {
  selectedPermissions: Record<string, Record<string, boolean>>;
  onChange: (permissions: Record<string, Record<string, boolean>>) => void;
}

const PERMISSION_TEMPLATES = {
  readonly: {
    label: 'Solo Lectura',
    description: 'Ver y descargar contenido',
    icon: Eye,
    permissions: ['view', 'download']
  },
  standard: {
    label: 'Estandar',
    description: 'Crear, editar y descargar',
    icon: Edit3,
    permissions: ['view', 'create', 'update', 'download']
  },
  advanced: {
    label: 'Avanzado',
    description: 'Todos excepto eliminar',
    icon: Zap,
    permissions: ['view', 'create', 'update', 'download', 'export', 'generate', 'sign', 'compare', 'restore']
  }
};

export default function PermissionsEditor({ selectedPermissions, onChange }: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(selectedPermissions || {});
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
    const newPermissions: Record<string, Record<string, boolean>> = {};

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

  const getCategoryPermCount = (modules: Array<{ key: string; label: string; actions: readonly string[] }>) => {
    return modules.reduce((acc, m) => {
      const perms = permissions[m.key] || {};
      return acc + Object.values(perms).filter(v => v === true).length;
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Plantillas de permisos */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Aplica una plantilla para comenzar rapidamente:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(PERMISSION_TEMPLATES).map(([key, template]) => {
            const IconComponent = template.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key as keyof typeof PERMISSION_TEMPLATES)}
                className="p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 
                           dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20
                           transition-all group"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <IconComponent className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {template.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 pl-5">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
        <Input
          placeholder="Buscar modulos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          aria-label="Buscar modulos de permisos"
        />
      </div>

      {/* Acordeón de categorías */}
      <Accordion 
        type="multiple" 
        defaultValue={Object.keys(filteredModulesByCategory)} 
        className="space-y-2"
      >
        {Object.entries(filteredModulesByCategory).map(([category, modules]) => {
          const categoryPermCount = getCategoryPermCount(modules);
          
          return (
            <AccordionItem 
              key={category} 
              value={category}
              className="border rounded-lg dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{category}</span>
                  {categoryPermCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs"
                    >
                      {categoryPermCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-2">
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
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
