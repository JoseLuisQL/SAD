'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TourStep {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
}

interface GuidedTourProps {
  tourKey: string;
  steps: TourStep[];
  run?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function GuidedTour({ 
  tourKey, 
  steps, 
  run: externalRun,
  onComplete,
  onSkip 
}: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (externalRun !== undefined) {
      setIsActive(externalRun);
      return;
    }
    
    const tourCompleted = localStorage.getItem(`tour-${tourKey}-completed`);
    if (!tourCompleted) {
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tourKey, externalRun]);

  const updateTargetRect = useCallback(() => {
    if (!isActive || currentStep >= steps.length) return;
    
    const step = steps[currentStep];
    const target = document.querySelector(step.target);
    
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    setIsActive(false);
    setCurrentStep(0);
    onSkip?.();
  };

  if (!isActive || !targetRect) return null;

  const step = steps[currentStep];
  const placement = step.placement || 'bottom';

  const getTooltipPosition = () => {
    const padding = 12;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + padding;
        break;
    }

    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    return { top, left };
  };

  const tooltipPos = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300"
        onClick={handleSkip}
      />
      
      {/* Spotlight */}
      <div
        className="fixed z-[9999] rounded-lg transition-all duration-300 pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 transition-all duration-300"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step.title && (
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h4>
          )}
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {step.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Saltar
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}

export function useTourReset(tourKey: string) {
  const resetTour = () => {
    localStorage.removeItem(`tour-${tourKey}-completed`);
    window.location.reload();
  };
  
  return { resetTour };
}

// Tour steps for new document page
export const newDocumentTourSteps: TourStep[] = [
  {
    target: '[data-tour="stepper"]',
    content: 'Este indicador muestra tu progreso. El proceso tiene 4 pasos: subir archivo, ingresar datos, revisar y confirmar.',
    title: 'Progreso del proceso',
    placement: 'bottom',
  },
  {
    target: '[data-tour="file-uploader"]',
    content: 'Arrastra tu archivo PDF aqui o haz clic para seleccionarlo. Solo se aceptan archivos PDF de hasta 50 MB.',
    title: 'Subir archivo',
    placement: 'bottom',
  },
  {
    target: '[data-tour="requirements"]',
    content: 'Aqui puedes ver los requisitos que debes cumplir. Los items se marcaran en verde cuando esten completos.',
    title: 'Requisitos',
    placement: 'left',
  },
  {
    target: '[data-tour="navigation-buttons"]',
    content: 'Usa estos botones para navegar entre pasos. Tu progreso se guarda automaticamente.',
    title: 'Navegacion',
    placement: 'top',
  },
];

// Tour steps for batch upload page
export const batchUploadTourSteps: TourStep[] = [
  {
    target: '[data-tour="batch-uploader"]',
    content: 'Arrastra multiples archivos PDF aqui o haz clic para seleccionarlos. Puedes subir hasta 50 archivos a la vez.',
    title: 'Subir archivos',
    placement: 'bottom',
  },
  {
    target: '[data-tour="common-metadata"]',
    content: 'Selecciona el archivador comun para todos los documentos. Este campo es obligatorio.',
    title: 'Archivador comun',
    placement: 'bottom',
  },
  {
    target: '[data-tour="metadata-table"]',
    content: 'Completa los metadatos especificos de cada archivo. Puedes usar el boton de copiar para duplicar datos del archivo anterior.',
    title: 'Metadatos por archivo',
    placement: 'top',
  },
  {
    target: '[data-tour="csv-actions"]',
    content: 'Puedes descargar una plantilla CSV, llenarla en Excel y volver a importarla para agilizar el proceso.',
    title: 'Importar/Exportar CSV',
    placement: 'bottom',
  },
];
