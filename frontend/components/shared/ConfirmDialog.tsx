'use client';

import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
  confirmText,
  cancelText = 'Cancelar',
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getDefaultConfirmText = () => {
    if (confirmText) return confirmText;
    switch (variant) {
      case 'danger':
        return 'Eliminar';
      case 'warning':
        return 'Continuar';
      case 'info':
        return 'Aceptar';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="dark:text-white text-lg">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription asChild className="dark:text-slate-400 mt-3 ml-9">
            <div>{message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={onCancel} 
            disabled={loading} 
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={getButtonClass()}
          >
            {loading ? 'Procesando...' : getDefaultConfirmText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
