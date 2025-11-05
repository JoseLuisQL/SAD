'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText,
  Eye,
  FileSignature
} from 'lucide-react';
import { Document } from '@/types/document.types';

type SignatureStatus = 'VALID' | 'PENDING' | 'INDETERMINATE';

interface SignatureSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  signatureStatus?: SignatureStatus;
  onSignAnother?: () => void;
}

const statusConfig = {
  VALID: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Firma Digital Completada',
    description: 'El documento ha sido firmado y validado automáticamente de manera exitosa. No se requieren pasos adicionales.',
  },
  PENDING: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    title: 'Firma Completada',
    description: 'El documento ha sido firmado digitalmente y se está procesando la validación automática.',
  },
  INDETERMINATE: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    title: 'Firma Completada',
    description: 'El documento ha sido firmado digitalmente. Puede consultar los detalles de validación en cualquier momento.',
  },
};

export function SignatureSuccessModal({
  open,
  onOpenChange,
  document,
  signatureStatus = 'VALID',
  onSignAnother,
}: SignatureSuccessModalProps) {
  const router = useRouter();
  const config = statusConfig[signatureStatus];
  const Icon = config.icon;

  const handleViewDocumentDetail = () => {
    if (document) {
      router.push(`/dashboard/archivo/documentos/${document.id}`);
      onOpenChange(false);
    }
  };

  const handleSignAnother = () => {
    if (onSignAnother) {
      onSignAnother();
    }
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    // Cuando se cierra el modal, redirigir a la página de selección de documentos
    if (!open && onSignAnother) {
      onSignAnother();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Proceso de Firma Completado
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Revise los detalles de la firma digital realizada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`${config.bgColor} p-3 rounded-full`}>
                  <Icon className={`h-8 w-8 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${config.color} mb-1`}>
                    {config.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {config.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Info */}
          {document && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Documento Firmado
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 break-words">
                      {document.fileName}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-200">Número:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{document.documentNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-200">Tipo:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{document.documentType.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-200">Oficina:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{document.office.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-200">Fecha:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">
                      {new Date(document.documentDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature Details */}
          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Documento Firmado y Validado
                  </h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Certificado digital de Firma Perú aplicado</li>
                    <li>• Timestamp criptográfico incluido</li>
                    <li>• Documento protegido contra modificaciones</li>
                    <li>• Firma conforme a estándares peruanos</li>
                    <li>• <strong className="dark:text-green-300">Validación completada automáticamente</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleViewDocumentDetail}
              variant="default"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalle Documento
            </Button>
            <Button
              onClick={handleSignAnother}
              variant="outline"
              className="flex-1"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Firmar Otro Documento
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-slate-700 dark:text-slate-300 text-center p-3 bg-green-100 dark:bg-green-950/40 rounded border border-green-200 dark:border-green-800">
            <p>
              <strong className="text-green-700 dark:text-green-300">✓ El documento ha sido firmado y validado exitosamente.</strong> Puede ver los detalles completos del documento
              o continuar firmando otros documentos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
