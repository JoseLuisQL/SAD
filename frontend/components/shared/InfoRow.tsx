'use client';

import { useState } from 'react';
import { Check, Copy, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  icon?: LucideIcon;
  copyable?: boolean;
  className?: string;
  valueClassName?: string;
  truncate?: boolean;
}

export function InfoRow({
  label,
  value,
  icon: Icon,
  copyable = false,
  className,
  valueClassName,
  truncate = false,
}: InfoRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const displayValue = value ?? '-';

  return (
    <div 
      className={cn(
        'flex items-center justify-between py-2.5 group',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <Icon 
            className="h-4 w-4 text-gray-400 dark:text-slate-500 flex-shrink-0" 
            aria-hidden="true" 
          />
        )}
        <span className="text-sm text-gray-600 dark:text-slate-400">
          {label}
        </span>
      </div>
      
      <div className="flex items-center gap-2 min-w-0 ml-4">
        <span 
          className={cn(
            'font-medium text-gray-900 dark:text-white text-right',
            truncate && 'truncate max-w-[200px]',
            valueClassName
          )}
          title={truncate ? String(displayValue) : undefined}
        >
          {displayValue}
        </span>
        
        {copyable && value && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-gray-100 dark:hover:bg-slate-700'
                  )}
                  onClick={handleCopy}
                  aria-label={copied ? 'Copiado' : `Copiar ${label}`}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Copiado!' : 'Copiar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
