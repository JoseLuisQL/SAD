'use client';

import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
}

interface HelpPanelProps {
  title?: string;
  faqs: FAQ[];
  className?: string;
}

export function HelpPanel({ title = 'Ayuda', faqs, className }: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn('fixed bottom-6 right-6 shadow-lg z-40', className)}
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        {title}
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 w-96 max-h-[600px] shadow-xl z-40 overflow-hidden',
        className
      )}
    >
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <HelpCircle className="mr-2 h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 max-h-[520px] overflow-y-auto space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full text-left flex items-start justify-between group"
            >
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors pr-2">
                {faq.question}
              </span>
              <span
                className={cn(
                  'text-gray-400 transition-transform flex-shrink-0',
                  expandedIndex === index && 'rotate-180'
                )}
              >
                ▼
              </span>
            </button>
            {expandedIndex === index && (
              <div className="mt-2 text-sm text-gray-600 animate-in slide-in-from-top-1 duration-200">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
