'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowNavigation?: boolean;
  className?: string;
}

export function Stepper({ 
  steps, 
  currentStep, 
  onStepClick,
  allowNavigation = true,
  className 
}: StepperProps) {
  
  const handleStepClick = (stepId: number, isCompleted: boolean) => {
    if (allowNavigation && isCompleted && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div 
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Progreso del formulario"
      data-tour="stepper"
    >
      <div 
        className="flex items-center justify-between"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Paso ${currentStep} de ${steps.length}`}
      >
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;
          const isClickable = allowNavigation && isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.id, isCompleted)}
                    disabled={!isClickable}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                      isCompleted &&
                        'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 shadow-sm',
                      isCurrent &&
                        'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 shadow-md scale-110',
                      isUpcoming &&
                        'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600',
                      isClickable && 'cursor-pointer hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      !isClickable && 'cursor-default'
                    )}
                    aria-label={`${isCompleted ? 'Completado: ' : isCurrent ? 'Actual: ' : 'Pendiente: '}Paso ${step.id}: ${step.name}${isClickable ? ' (clic para volver)' : ''}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isCurrent && 'text-white',
                          isUpcoming && 'text-gray-500 dark:text-slate-400'
                        )}
                        aria-hidden="true"
                      >
                        {step.id}
                      </span>
                    )}
                  </button>

                  {/* Step Labels */}
                  <div className="mt-3 text-center max-w-[150px]">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isCurrent && 'text-blue-600 dark:text-blue-400 font-semibold',
                        isCompleted && 'text-gray-900 dark:text-white',
                        isUpcoming && 'text-gray-500 dark:text-slate-400',
                        isClickable && 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400'
                      )}
                      onClick={() => handleStepClick(step.id, isCompleted)}
                    >
                      {step.name}
                    </p>
                    {step.description && (
                      <p
                        className={cn(
                          'text-xs mt-1 transition-colors',
                          isCurrent && 'text-blue-500 dark:text-blue-400',
                          isCompleted && 'text-gray-600 dark:text-slate-400',
                          isUpcoming && 'text-gray-400 dark:text-slate-500'
                        )}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-full mx-4 transition-colors duration-200',
                      isCompleted ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-slate-600'
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Paso {currentStep} de {steps.length}: {steps[currentStep - 1]?.name}
      </div>
    </div>
  );
}
