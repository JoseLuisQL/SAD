'use client';

import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldWithHelpProps {
  label: string;
  help: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export function FieldWithHelp({
  label,
  help,
  required = false,
  htmlFor,
  children,
  className,
  error,
}: FieldWithHelpProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor={htmlFor}
          className="text-gray-900 dark:text-white font-semibold"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-label="campo requerido">*</span>}
        </Label>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                aria-label={`Ayuda sobre ${label}`}
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{help}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
