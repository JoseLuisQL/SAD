'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalValidatorCard } from '@/components/firma/ExternalValidatorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Document } from '@/types/document.types';
import { documentsApi } from '@/lib/api/documents';
import { toast } from 'sonner';
import { HelpCircle, FileText, Download, Info } from 'lucide-react';

function ValidarFirmaContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const [document, setDocument] = useState<Document | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (documentId) {
        try {
          setLoadingDocument(true);
          const response = await documentsApi.getById(documentId);
          setDocument(response.data.data);
        } catch (error) {
          console.error('Error al cargar el documento:', error);
          toast.error('No se pudo cargar el documento especificado.');
        } finally {
          setLoadingDocument(false);
        }
      }
    };
    fetchDocument();
  }, [documentId]);

  const handleDownloadDocument = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
      toast.success('Descargando documento...');
    }
  };

  return (
    <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)] max-w-5xl mx-auto">
      {/* Información del documento si viene de un contexto específico */}
      {documentId && (
        <div className="mb-6">
          {loadingDocument ? (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ) : document ? (
            <Alert className="border-slate-200 bg-blue-50/50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold mb-1 text-slate-900">Documento seleccionado:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-slate-900">{document.fileName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{document.documentNumber}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadDocument}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Descargue el documento y luego valídelo en el portal oficial de Firma Perú.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      )}

      {/* Componente principal de validación */}
      <ExternalValidatorCard
        title="Validación de Firma Digital"
        description="Para realizar la validación de un documento firmado digitalmente, será redirigido al Validador Oficial de Firma Perú."
        validatorUrl="https://apps.firmaperu.gob.pe/web/validador.xhtml"
        validatorName="Validador de Firma Perú"
      />

      {/* Card de Ayuda Adicional */}
      <Card className="mt-6 bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            ¿Necesita ayuda?
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Recursos útiles para validar documentos con firma digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.firmaperu.gob.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">
                    Portal Firma Perú
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Información general sobre Firma Perú
                  </p>
                </div>
              </a>

              <a
                href="https://www.firmaperu.gob.pe/preguntas-frecuentes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">
                    Preguntas Frecuentes
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Respuestas a dudas comunes sobre firma digital
                  </p>
                </div>
              </a>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-sm text-slate-900 mb-2">
                Información importante:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Solo puede validar documentos en formato PDF firmados digitalmente
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    La validación verifica la autenticidad de la firma en el momento de la consulta
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Si el documento fue modificado después de ser firmado, la validación fallará
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Puede guardar el reporte de validación para sus registros
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ValidarFirmaPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)] max-w-5xl mx-auto">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <ValidarFirmaContent />
    </Suspense>
  );
}
