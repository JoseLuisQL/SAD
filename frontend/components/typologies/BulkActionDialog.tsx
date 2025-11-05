'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BulkActionDialogProps {
  open: boolean;
  operation: 'delete' | 'activate' | 'deactivate';
  items: Array<{ id: string; code?: string; name: string }>;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BulkActionDialog({
  open,
  operation,
  items,
  onConfirm,
  onCancel,
  loading = false
}: BulkActionDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  const getOperationConfig = () => {
    switch (operation) {
      case 'delete':
        return {
          title: 'Eliminar Elementos',
          description: '¿Está seguro de que desea eliminar los siguientes elementos? Esta acción no se puede deshacer.',
          buttonText: 'Eliminar',
          buttonVariant: 'destructive' as const,
          icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        };
      case 'activate':
        return {
          title: 'Activar Elementos',
          description: 'Los siguientes elementos serán marcados como activos:',
          buttonText: 'Activar',
          buttonVariant: 'default' as const,
          icon: null
        };
      case 'deactivate':
        return {
          title: 'Desactivar Elementos',
          description: 'Los siguientes elementos serán marcados como inactivos:',
          buttonText: 'Desactivar',
          buttonVariant: 'secondary' as const,
          icon: null
        };
    }
  };

  const config = getOperationConfig();

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setConfirmed(false);
    } catch (error) {
      console.error('Error en operación masiva:', error);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Elementos seleccionados: {items.length}
            </p>
            <ScrollArea className="h-[200px] pr-4">
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li 
                    key={item.id} 
                    className="flex items-center gap-2 text-sm bg-white dark:bg-slate-700 p-2 rounded border border-gray-200 dark:border-slate-600"
                  >
                    <span className="font-mono text-gray-500 dark:text-slate-400">
                      {idx + 1}.
                    </span>
                    {item.code && (
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {item.code}
                      </span>
                    )}
                    <span className="text-gray-900 dark:text-slate-200">{item.name}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {operation === 'delete' && (
            <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <Checkbox
                id="confirm-action"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="confirm-action"
                  className="text-sm font-medium text-red-900 dark:text-red-300 cursor-pointer"
                >
                  Estoy seguro de esta acción
                </Label>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Esta operación es irreversible y los datos no podrán recuperarse.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={(operation === 'delete' && !confirmed) || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
