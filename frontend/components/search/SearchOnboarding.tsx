'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
  {
    target: '[data-tour="search-input"]',
    title: '1. Barra de búsqueda',
    description: 'Escribe cualquier término para buscar en documentos, números, remitentes o contenido OCR.',
    position: 'bottom',
  },
  {
    target: '[data-tour="search-filters-button"]',
    title: '2. Filtros avanzados',
    description: 'Refina tu búsqueda por tipo de documento, fecha, oficina y más.',
    position: 'bottom',
  },
  {
    target: '[data-tour="search-results-table"]',
    title: '3. Resultados',
    description: 'Los resultados muestran coincidencias resaltadas. Haz clic en cualquier documento para verlo.',
    position: 'top',
  },
];

interface SearchOnboardingProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function SearchOnboarding({ onComplete, forceShow = false }: SearchOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }
    
    const hasSeenOnboarding = localStorage.getItem('search-onboarding-completed');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const calculatePosition = useCallback(() => {
    if (!isVisible) return;
    
    const step = steps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const offset = 12;
    
    let top = 0;
    let left = 0;
    
    switch (step.position) {
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + offset;
        break;
    }
    
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
    
    setTooltipPosition({ top, left });
  }, [currentStep, isVisible]);

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [calculatePosition]);

  const handleComplete = () => {
    localStorage.setItem('search-onboarding-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || !mounted) return null;

  const step = steps[currentStep];
  const targetElement = document.querySelector(step.target);

  const content = (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay oscuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleSkip}
      />
      
      {/* Highlight del elemento actual */}
      {targetElement && (
        <div
          className="absolute bg-transparent ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent rounded-lg pointer-events-none transition-all duration-300"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="absolute bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-5 w-80
                   border border-slate-200 dark:border-slate-700 transition-all duration-300"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      >
        <button 
          onClick={handleSkip}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Cerrar tour"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {step.title}
          </h4>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          {step.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep 
                    ? 'bg-blue-600 dark:bg-blue-500' 
                    : i < currentStep
                    ? 'bg-blue-300 dark:bg-blue-700'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev} className="h-8">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="h-8">
              {currentStep < steps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Entendido'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
