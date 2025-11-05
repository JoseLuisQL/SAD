'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CoachMarkStep } from '@/types/onboarding.types';

interface CoachMarksProps {
  steps: CoachMarkStep[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  tourName: string;
}

export function CoachMarks({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  tourName,
}: CoachMarksProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0, 
    height: 0 
  });
  const [isWaitingForTarget, setIsWaitingForTarget] = useState(true);
  const [waitAttempts, setWaitAttempts] = useState(0);
  const [shouldAutoSkip, setShouldAutoSkip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const calculatePositions = useCallback(() => {
    if (!step) {
      console.warn('[CoachMarks] No step provided');
      return;
    }

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      console.error(`[CoachMarks] ❌ Target element not found: ${step.target}`);
      console.log('[CoachMarks] Available data-tour elements:', 
        Array.from(document.querySelectorAll('[data-tour]')).map(el => el.getAttribute('data-tour'))
      );
      return;
    }

    console.log(`[CoachMarks] ✅ Found target: ${step.target}`);
    // Mark that we found the target
    if (isWaitingForTarget) {
      setIsWaitingForTarget(false);
    }

    const targetRect = targetElement.getBoundingClientRect();
    const padding = step.highlightPadding || 8;

    // Highlight position - using viewport coordinates only for fixed positioning
    setHighlightPosition({
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
    });

    // Card position - using viewport coordinates only for fixed positioning
    const cardHeight = cardRef.current?.offsetHeight || 200;
    const cardWidth = cardRef.current?.offsetWidth || 320;
    const placement = step.placement || 'bottom';

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - cardHeight - 16;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 16;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2;
        left = targetRect.left - cardWidth - 16;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2;
        left = targetRect.right + 16;
        break;
    }

    // Ensure card stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 16) left = 16;
    if (left + cardWidth > viewportWidth - 16) left = viewportWidth - cardWidth - 16;
    if (top < 16) top = 16;
    if (top + cardHeight > viewportHeight - 16) {
      top = viewportHeight - cardHeight - 16;
    }

    setPosition({ top, left });
  }, [step, isWaitingForTarget]);

  // Reset waiting state when step changes
  useEffect(() => {
    setIsWaitingForTarget(true);
    setWaitAttempts(0);
    setShouldAutoSkip(false);
  }, [currentStep]);

  // Handle auto-skip when element is not found after max attempts
  useEffect(() => {
    if (!shouldAutoSkip) return;

    console.warn(`[CoachMarks] ⏭️ Target missing after max attempts, auto-skipping: ${step?.target}`);

    // Reset the flag
    setShouldAutoSkip(false);

    // If this is the first step, skip the entire tour
    if (isFirstStep) {
      console.warn('[CoachMarks] First step missing, skipping entire tour');
      onSkip();
      return;
    }

    // Otherwise, try to move to the next step
    if (!isLastStep) {
      console.log('[CoachMarks] Attempting to move to next step...');
      onNext();
      return;
    } else {
      // Last step is missing, complete the tour
      console.log('[CoachMarks] Last step missing, completing tour');
      onComplete();
      return;
    }
  }, [shouldAutoSkip, step, isFirstStep, isLastStep, onSkip, onNext, onComplete]);

  // Effect to wait for target element to appear
  useEffect(() => {
    if (!step) return;

    const targetElement = document.querySelector(step.target);
    
    if (!targetElement && waitAttempts < 10) {
      // Element not found yet, retry after a delay
      const timer = setTimeout(() => {
        console.log(`[CoachMarks] Waiting for target (attempt ${waitAttempts + 1}/10): ${step.target}`);
        setWaitAttempts(prev => prev + 1);
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (targetElement) {
      // Element found, mark as ready
      console.log(`[CoachMarks] ✅ Target ready after ${waitAttempts} attempts`);
      setIsWaitingForTarget(false);
      setWaitAttempts(0);
    }
  }, [step, waitAttempts, currentStep]);

  // Effect to calculate positions and handle scroll/resize
  useEffect(() => {
    if (!step) return;
    if (isWaitingForTarget) return; // Don't calculate positions until target is ready

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    // Scroll element into view if needed
    const rect = targetElement.getBoundingClientRect();
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );

    if (!isInViewport) {
      targetElement.scrollIntoView({ 
        block: 'center', 
        behavior: 'smooth',
        inline: 'center'
      });
      // Wait for scroll to complete before calculating positions
      setTimeout(() => calculatePositions(), 300);
    } else {
      calculatePositions();
    }

    let rafId: number | null = null;
    let resizeRafId: number | null = null;

    // Throttled scroll handler with requestAnimationFrame
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        calculatePositions();
        rafId = null;
      });
    };

    // Throttled resize handler with requestAnimationFrame
    const handleResize = () => {
      if (resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        calculatePositions();
        resizeRafId = null;
      });
    };

    // ResizeObserver for target element changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === targetElement) {
          handleResize();
        }
      }
    });

    resizeObserver.observe(targetElement);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculatePositions, step, isWaitingForTarget]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const verifyNextStepTarget = useCallback((nextIndex: number): boolean => {
    if (nextIndex >= steps.length) return true; // Completed
    
    const nextStep = steps[nextIndex];
    const nextTarget = document.querySelector(nextStep.target);
    
    if (!nextTarget) {
      console.warn('[CoachMarks] Next step target not found:', nextStep.target);
      return false;
    }
    
    return true;
  }, [steps]);

  const handleNext = useCallback(() => {
    const nextIndex = currentStep + 1;
    
    if (isLastStep) {
      onComplete();
      return;
    }
    
    // Verify next step target exists
    if (!verifyNextStepTarget(nextIndex)) {
      // Show contextual message
      console.warn('[CoachMarks] Cannot advance - next element not ready');
      // Try again after a delay
      setTimeout(() => {
        if (verifyNextStepTarget(nextIndex)) {
          onNext();
        }
      }, 1000);
      return;
    }
    
    onNext();
  }, [currentStep, isLastStep, onNext, onComplete, verifyNextStepTarget]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSkip();
    } else if (e.key === 'ArrowRight' && !isLastStep) {
      handleNext();
    } else if (e.key === 'ArrowLeft' && !isFirstStep) {
      onPrevious();
    } else if (e.key === 'Enter' && isLastStep) {
      onComplete();
    }
  };

  // NOW WE CAN DO CONDITIONAL RETURNS (after all hooks are called)
  if (!step) {
    console.warn('[CoachMarks] No step available, not rendering');
    return null;
  }

  // Check if still waiting for target element
  if (isWaitingForTarget) {
    const targetExists = document.querySelector(step.target);
    if (!targetExists && waitAttempts >= 10 && !shouldAutoSkip) {
      // Exceeded max attempts, trigger auto-skip via useEffect
      console.log(`[CoachMarks] ⏭️ Max attempts reached for: ${step.target}`);
      setShouldAutoSkip(true);
    }
    
    // Still waiting, don't render yet
    if (waitAttempts > 0 && waitAttempts % 3 === 0) {
      console.log(`[CoachMarks] Waiting for target to appear (attempt ${waitAttempts}/10)...`);
    }
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Highlight */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-lg transition-transform duration-200"
        style={{
          top: `${highlightPosition.top}px`,
          left: `${highlightPosition.left}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Coach Mark Card */}
      <Card
        ref={cardRef}
        className="fixed z-[10000] w-80 shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        role="dialog"
        aria-labelledby="coach-mark-title"
        aria-describedby="coach-mark-content"
        onKeyDown={handleKeyDown}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle id="coach-mark-title" className="text-lg font-semibold">
              {step.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0"
              aria-label="Cerrar tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p id="coach-mark-content" className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          {step.action && (
            <Button
              onClick={step.action.onClick}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {step.action.label}
            </Button>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs"
            >
              Saltar tutorial
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  aria-label="Paso anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {isLastStep ? (
                <Button
                  onClick={onComplete}
                  size="sm"
                  className="gap-1"
                >
                  Finalizar
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="gap-1"
                  aria-label="Siguiente paso"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function CoachMarkProgress({ 
  current, 
  total 
}: { 
  current: number; 
  total: number;
}) {
  return (
    <div className="flex gap-1" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i <= current ? 'bg-primary flex-1' : 'bg-muted w-1.5'
          )}
        />
      ))}
    </div>
  );
}
