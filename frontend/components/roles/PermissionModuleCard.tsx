'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ACTION_LABELS } from '@/lib/permissions';

interface PermissionModuleCardProps {
  moduleKey: string;
  moduleLabel: string;
  actions: readonly string[];
  selectedPermissions: Record<string, boolean>;
  onPermissionToggle: (action: string) => void;
  onModuleToggle: () => void;
}

export default function PermissionModuleCard({
  moduleKey,
  moduleLabel,
  actions,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
}: PermissionModuleCardProps) {
  const allSelected = actions.every(action => selectedPermissions[action] === true);
  const someSelected = actions.some(action => selectedPermissions[action] === true);
  const selectedCount = actions.filter(action => selectedPermissions[action] === true).length;

  return (
    <div className="p-3 border rounded-lg dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`module-${moduleKey}`}
            checked={allSelected}
            onCheckedChange={onModuleToggle}
            className={someSelected && !allSelected ? 'opacity-60' : ''}
            aria-label={`Seleccionar todos los permisos de ${moduleLabel}`}
          />
          <div>
            <Label 
              htmlFor={`module-${moduleKey}`} 
              className="font-medium text-gray-900 dark:text-white cursor-pointer text-sm"
            >
              {moduleLabel}
            </Label>
            {someSelected && (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {selectedCount} de {actions.length}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 pl-6">
        {actions.map((action) => {
          const isChecked = selectedPermissions[action] === true;
          return (
            <label
              key={action}
              className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer
                transition-colors border
                ${isChecked 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'}
              `}
            >
              <Checkbox
                id={`${moduleKey}-${action}`}
                checked={isChecked}
                onCheckedChange={() => onPermissionToggle(action)}
                className="h-3 w-3"
                aria-label={`${ACTION_LABELS[action] || action} en ${moduleLabel}`}
              />
              <span>{ACTION_LABELS[action] || action}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
