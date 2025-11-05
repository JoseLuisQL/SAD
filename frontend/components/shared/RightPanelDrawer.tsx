'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RightPanelDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

const widthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function RightPanelDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  footer,
}: RightPanelDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-white dark:bg-slate-900 shadow-lg z-50 transition-transform duration-300 ease-in-out',
          widthClasses[width],
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex-1 min-w-0">
            <h2
              id="drawer-title"
              className="text-xl font-semibold text-gray-900 dark:text-white truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-4 flex-shrink-0 dark:hover:bg-slate-800"
            aria-label="Cerrar panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-5rem)] bg-gray-50 dark:bg-slate-950">
          <div className="p-6">{children}</div>
        </ScrollArea>

        {/* Footer */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
