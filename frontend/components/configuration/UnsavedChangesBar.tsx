'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';

interface UnsavedChangesBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesBar({
  isDirty,
  isSaving,
  onSave,
  onDiscard,
}: UnsavedChangesBarProps) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (!isDirty) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50">
      <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Tienes cambios sin guardar</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={isSaving}
              className="gap-2 border-slate-300 dark:border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              Descartar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
