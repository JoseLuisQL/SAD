'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Checkbox
              id={`module-${moduleKey}`}
              checked={allSelected}
              onCheckedChange={onModuleToggle}
              className={someSelected && !allSelected ? 'opacity-50' : ''}
            />
            <div className="flex-1">
              <Label htmlFor={`module-${moduleKey}`} className="text-base font-semibold cursor-pointer text-gray-900 dark:text-white">
                {moduleLabel}
              </Label>
              <CardDescription className="mt-1 text-gray-600 dark:text-slate-400 font-medium">
                {allSelected 
                  ? 'Todos los permisos seleccionados' 
                  : someSelected 
                  ? `${selectedCount} de ${actions.length} permisos` 
                  : 'Sin permisos'}
              </CardDescription>
            </div>
          </div>
          {someSelected && (
            <Badge variant={allSelected ? 'default' : 'secondary'} className={allSelected ? '' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium'}>
              {selectedCount}/{actions.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {actions.map((action) => {
            const isChecked = selectedPermissions[action] === true;

            return (
              <div key={action} className="flex items-center space-x-2">
                <Checkbox
                  id={`${moduleKey}-${action}`}
                  checked={isChecked}
                  onCheckedChange={() => onPermissionToggle(action)}
                />
                <Label
                  htmlFor={`${moduleKey}-${action}`}
                  className="text-sm font-medium cursor-pointer text-gray-800 dark:text-slate-200"
                >
                  {ACTION_LABELS[action] || action}
                </Label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
