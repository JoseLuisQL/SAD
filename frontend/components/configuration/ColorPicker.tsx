'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ColorPickerProps {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (color: string) => void;
  helpText?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function ColorPicker({
  id,
  label,
  value,
  onChange,
  helpText,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const currentValue = value || '#3b82f6';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                  aria-label={`Ayuda sobre ${label}`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            id={id}
            type="color"
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-transparent"
            aria-label={`Selector de ${label}`}
          />
        </div>
        <Input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-28 font-mono uppercase text-sm"
          maxLength={7}
          aria-label={`Valor hexadecimal de ${label}`}
        />
        <div
          className="w-20 h-10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner"
          style={{ backgroundColor: currentValue }}
          role="img"
          aria-label={`Vista previa del color ${currentValue}`}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Colores predefinidos">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`w-7 h-7 rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              currentValue.toLowerCase() === preset.toLowerCase()
                ? 'border-slate-900 dark:border-white scale-110 shadow-md'
                : 'border-transparent hover:scale-105 hover:shadow-sm'
            }`}
            style={{ backgroundColor: preset }}
            aria-label={`Seleccionar color ${preset}`}
            aria-pressed={currentValue.toLowerCase() === preset.toLowerCase()}
          />
        ))}
      </div>
    </div>
  );
}
