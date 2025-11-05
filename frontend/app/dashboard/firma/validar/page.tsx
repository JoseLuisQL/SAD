'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalValidatorCard } from '@/components/firma/ExternalValidatorCard';
import { InfoBanner } from '@/components/firma/InfoBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/types/document.types';
import { documentsApi } from '@/lib/api/documents';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  HelpCircle
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

function ValidarFirmaContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const [document, setDocument] = useState<Document | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const { startTour, resetTour } = useOnboarding();

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        try {
          setLoadingDocument(true);
          const docResponse = await documentsApi.getById(documentId);
          setDocument(docResponse.data.data);
        } catch (error) {
          console.error('Error al cargar datos:', error);
          toast.error('No se pudieron cargar los datos del documento.');
        } finally {
          setLoadingDocument(false);
        }
      }
    };
    fetchData();
  }, [documentId]);

  const handleDownloadDocument = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
      toast.success('Descargando documento...');
    }
  };

  const handleStartTour = () => {
    resetTour('firma-validar-tour');
    setTimeout(() => {
      startTour('firma-validar-tour');
    }, 100);
  };

  return (
    <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)] max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between" data-tour="firma-validar-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Validación de Firma Digital
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Verificación externa de firmas digitales del documento.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartTour}
          className="gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Iniciar Tour
        </Button>
      </div>

      {/* Información del documento seleccionado */}
      {documentId && loadingDocument ? (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ) : document ? (
        <InfoBanner variant="info" className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-1 dark:text-slate-100">Documento seleccionado:</p>
              <div className="flex items-center gap-2 text-sm dark:text-slate-300">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{document.fileName}</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span>{document.documentNumber}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDocument}
              className="gap-2 ml-4"
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </InfoBanner>
      ) : null}

      {/* Validación Externa */}
      <div className="space-y-6">
        <ExternalValidatorCard
          title="Validación Externa - Firma Perú"
          description="Para una validación oficial completa, utilice el Validador de Firma Perú del gobierno peruano."
          validatorUrl="https://apps.firmaperu.gob.pe/web/validador.xhtml"
          validatorName="Validador Oficial de Firma Perú"
        />
        
        {document && (
          <InfoBanner variant="info">
            <p className="text-sm dark:text-slate-300">
              <strong>Recomendación:</strong> Descargue el documento y cárguelo en el validador externo 
              para obtener una validación oficial y completa de todas las firmas digitales.
            </p>
          </InfoBanner>
        )}
      </div>
    </div>
  );
}

export default function ValidarFirmaPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)] max-w-7xl mx-auto">
          <Skeleton className="h-10 w-96 mb-6" />
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <ValidarFirmaContent />
    </Suspense>
  );
}
