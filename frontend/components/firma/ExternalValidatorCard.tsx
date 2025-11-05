'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface ExternalValidatorCardProps {
  title: string;
  description: string;
  validatorUrl: string;
  validatorName: string;
  officialBadgeText?: string;
  validationFeatures?: string[];
  instructionSteps?: string[];
}

export function ExternalValidatorCard({
  title,
  description,
  validatorUrl,
  validatorName,
  officialBadgeText = 'Servicio Oficial del Estado Peruano',
  validationFeatures = [
    'Validez del certificado digital',
    'Integridad del documento',
    'Vigencia de la firma',
    'Cadena de confianza',
  ],
  instructionSteps = [
    'Será redirigido al portal oficial de Firma Perú',
    'Deberá cargar el documento PDF firmado en el validador',
    'El sistema mostrará el estado de la firma digital',
    'Podrá descargar el reporte de validación',
  ],
}: ExternalValidatorCardProps) {
  const handleOpenValidator = () => {
    window.open(validatorUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Card de Información Principal */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                {title}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-slate-600 dark:text-slate-400">{description}</CardDescription>
            </div>
            <Badge variant="outline" className="ml-4 border-slate-300 dark:border-slate-600">
              {officialBadgeText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instrucciones */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
              Pasos para realizar la validación:
            </h3>
            <ol className="space-y-2">
              {instructionSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Información del validador */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
              Sobre el {validatorName}:
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              El validador de Firma Perú es el servicio oficial del Estado Peruano
              para verificar la autenticidad de firmas digitales.
            </p>
            <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">
                El validador verifica:
              </h4>
              <ul className="space-y-1.5">
                {validationFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botón Principal */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleOpenValidator}
              size="lg"
              className="gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              Ir al {validatorName}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
