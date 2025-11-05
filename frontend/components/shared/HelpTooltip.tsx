'use client';

import React from 'react';
import { HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getGlossaryTerm, type GlossaryTerm } from '@/lib/glossary';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  term?: string;
  content?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'info';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  triggerClassName?: string;
}

export function HelpTooltip({
  term,
  content,
  children,
  variant = 'default',
  side = 'top',
  className,
  triggerClassName,
}: HelpTooltipProps) {
  const glossaryTerm: GlossaryTerm | undefined = term ? getGlossaryTerm(term) : undefined;
  const displayContent = content || glossaryTerm?.definition;

  if (!displayContent) {
    return children || null;
  }

  const Icon = variant === 'info' ? Info : HelpCircle;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            'inline-flex items-center gap-1 cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
            triggerClassName
          )}
          aria-label={`Ayuda: ${glossaryTerm?.term || 'información adicional'}`}
        >
          {children}
          <Icon 
            className={cn(
              'h-4 w-4 text-muted-foreground hover:text-foreground transition-colors',
              className
            )} 
          />
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs p-3 text-sm"
          role="tooltip"
          aria-live="polite"
        >
          {glossaryTerm ? (
            <div className="space-y-2">
              <div className="font-semibold text-foreground">{glossaryTerm.term}</div>
              <p className="text-muted-foreground leading-relaxed">{glossaryTerm.definition}</p>
              {glossaryTerm.examples && glossaryTerm.examples.length > 0 && (
                <div className="text-xs text-muted-foreground pt-1 border-t">
                  <span className="font-medium">Ejemplos: </span>
                  {glossaryTerm.examples.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">{displayContent}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function InlineHelpTooltip({
  term,
  content,
  text,
  className,
}: {
  term?: string;
  content?: string;
  text: string;
  className?: string;
}) {
  return (
    <HelpTooltip term={term} content={content} triggerClassName={className}>
      <span className="inline-flex items-center gap-1">
        {text}
      </span>
    </HelpTooltip>
  );
}
