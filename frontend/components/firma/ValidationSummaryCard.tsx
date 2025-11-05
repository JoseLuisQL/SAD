import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, ShieldCheck, FileText, Calendar, User, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValidationSummaryCardProps {
  validation: {
    result: string;
    validationDate: string;
    signatures: number;
    validSignatures: number;
    integrity: string;
    observations: string[];
    trustedSignatures: boolean;
    isValid: boolean;
    hasSignatures: boolean;
  } | null;
  fileName: string;
  documentNumber: string;
  onDownloadReport?: () => void;
  isLoading?: boolean;
}

export const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({
  validation,
  fileName,
  documentNumber,
  onDownloadReport,
  isLoading = false,
}) => {
  const getStatusBadge = () => {
    if (!validation || !validation.hasSignatures) {
      return (
        <Badge variant="secondary" className="gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          Sin Firmas
        </Badge>
      );
    }

    if (validation.isValid) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" />
          Válido
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Inválido
      </Badge>
    );
  };

  const getIntegrityIcon = () => {
    if (!validation) return null;
    
    const isIntact = validation.integrity === 'ÍNTEGRO' || validation.integrity === 'OK';
    return isIntact ? (
      <ShieldCheck className="h-5 w-5 text-green-600" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-lg">Resumen de Validación</span>
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-1">
              Estado actual de las firmas digitales del documento
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información del documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Documento
              </p>
              <p className="text-sm font-medium text-slate-900 truncate" title={fileName}>
                {fileName}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{documentNumber}</p>
            </div>
          </div>

          {validation && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Última Validación
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {format(new Date(validation.validationDate), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {format(new Date(validation.validationDate), "HH:mm:ss", { locale: es })}
                </p>
              </div>
            </div>
          )}
        </div>

        {validation && validation.hasSignatures ? (
          <>
            {/* Estado de Integridad y Firmas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {getIntegrityIcon()}
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Integridad
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {validation.integrity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Firmas
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {validation.validSignatures} de {validation.signatures} válidas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ShieldCheck className={`h-5 w-5 ${validation.trustedSignatures ? 'text-green-600' : 'text-amber-600'}`} />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Confiabilidad
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {validation.trustedSignatures ? 'Confiable' : 'No Verificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {validation.observations && validation.observations.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-sm text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Observaciones
                </h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  {validation.observations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Este documento no tiene firmas digitales registradas.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Puede agregar una firma digital desde el panel de documentos.
            </p>
          </div>
        )}

        {/* CTA - Descargar Reporte */}
        {validation && validation.hasSignatures && onDownloadReport && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={onDownloadReport}
              disabled={isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Reporte PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
