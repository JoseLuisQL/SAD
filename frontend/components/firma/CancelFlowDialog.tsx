'use client';

import React from 'react';
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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { SignatureFlow } from '@/types/signature.types';

interface CancelFlowDialogProps {
  flow: SignatureFlow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function CancelFlowDialog({ 
  flow, 
  open, 
  onOpenChange, 
  onConfirm, 
  loading 
}: CancelFlowDialogProps) {
  if (!flow) return null;
  
  const signedCount = flow.signers.filter(s => s.status === 'SIGNED').length;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 
                          flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-center">
            Cancelar Flujo de Firma
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-center space-y-3">
              <p>
                Estas a punto de cancelar el flujo <strong className="text-slate-900 dark:text-slate-100">&quot;{flow.name}&quot;</strong>
              </p>
              {signedCount > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg 
                                text-amber-800 dark:text-amber-300 text-sm text-left">
                  <strong>Atencion:</strong> Este flujo ya tiene {signedCount} firma(s) 
                  registrada(s). Al cancelar, las firmas existentes se mantendran 
                  pero el flujo no podra continuar.
                </div>
              )}
              <p className="text-sm">
                Esta accion no se puede deshacer.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading}>
            Mantener Flujo
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Si, Cancelar Flujo'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
