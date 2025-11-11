'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CoachMarks } from './CoachMarks';
import { useOnboarding, useTourStatus } from '@/hooks/useOnboarding';
import { getTour } from '@/lib/tours';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentTour,
    currentStep,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    startTour,
    resetTour,
    completedTours,
    skippedTours,
  } = useOnboarding();

  // Auto-start tours based on route
  useEffect(() => {
    console.log('[OnboardingProvider] useEffect triggered', { pathname, currentTour });
    
    // Check if there's a forced tour start from Help Center
    const forcedTourId = sessionStorage.getItem('force-tour-start');
    if (forcedTourId) {
      console.log('[OnboardingProvider] 🎯 Forced tour start detected:', forcedTourId);
      sessionStorage.removeItem('force-tour-start');
      
      // Give DOM time to render with retry mechanism
      const tryStartForcedTour = (attempt: number = 1, maxAttempts: number = 8) => {
        const tour = getTour(forcedTourId);
        console.log(`[OnboardingProvider] Forced tour attempt ${attempt}/${maxAttempts} - Tour:`, tour?.name);
        
        if (tour) {
          const firstTarget = document.querySelector(tour.steps[0].target);
          console.log(`[OnboardingProvider] Target: ${tour.steps[0].target} →`, firstTarget ? '✅ FOUND' : '❌ NOT FOUND');
          
          if (firstTarget) {
            console.log('[OnboardingProvider] 🚀 Starting forced tour:', forcedTourId);
            resetTour(forcedTourId); // Reset to allow restart
            startTour(forcedTourId);
          } else if (attempt < maxAttempts) {
            const delay = Math.min(attempt * 500, 2000);
            console.log(`[OnboardingProvider] ⏳ Retrying forced tour in ${delay}ms...`);
            setTimeout(() => tryStartForcedTour(attempt + 1, maxAttempts), delay);
          } else {
            console.warn('[OnboardingProvider] ⚠️ Forced tour start cancelled - element not ready after multiple attempts.');
          }
        }
      };
      
      setTimeout(() => tryStartForcedTour(1, 8), 2000);
      return;
    }
    
    if (currentTour) {
      console.log('[OnboardingProvider] Tour already active, skipping auto-start');
      return; // Don't auto-start if already in a tour
    }

    const routeToTourMap: Record<string, string> = {
      // Principal
      '/dashboard': 'general-tour',
      // Consultas
      '/dashboard/consultas/busqueda': 'busqueda-tour',
      // Archivo Digital
      '/dashboard/archivo/archivadores': 'archivadores-tour',
      '/dashboard/archivo/documentos': 'documentos-tour',
      '/dashboard/archivo/expedientes': 'expedientes-tour',
      // Firma Digital
      '/dashboard/firma/firmar': 'firma-firmar-tour',
      '/dashboard/firma/flujos': 'firma-flujos-tour',
      '/dashboard/firma/validar': 'firma-validar-tour',
      '/dashboard/firma/analytics': 'firma-analytics-tour',
      // Reportes
      '/dashboard/reportes': 'reportes-intro-tour',
      // Administración
      '/dashboard/admin/usuarios': 'usuarios-tour',
      '/dashboard/admin/oficinas': 'oficinas-tour',
      '/dashboard/admin/tipos-documento': 'tipos-documento-tour',
      '/dashboard/admin/periodos': 'periodos-tour',
      '/dashboard/admin/auditoria': 'auditoria-tour',
      // Configuración
      '/dashboard/roles': 'roles-tour',
      '/dashboard/configuracion': 'configuracion-tour',
      // Seguridad
      '/dashboard/seguridad/copias': 'copias-seguridad-tour',
    };

    const tourId = routeToTourMap[pathname];
    console.log('[OnboardingProvider] Route matched tour:', tourId);
    
    if (tourId) {
      // Check if tour should show (not completed and not skipped)
      const shouldShow = !completedTours.includes(tourId) && !skippedTours.includes(tourId);
      console.log('[OnboardingProvider] Should show tour?', shouldShow, {
        completedTours,
        skippedTours
      });
      
      if (shouldShow) {
        // Delay to ensure DOM is ready with retry mechanism
        console.log('[OnboardingProvider] Scheduling tour start...');
        
        const tryStartTour = (attempt: number = 1, maxAttempts: number = 8) => {
          const tour = getTour(tourId);
          console.log(`[OnboardingProvider] Attempt ${attempt}/${maxAttempts} - Tour:`, tour?.name);
          
          if (tour) {
            const firstTarget = document.querySelector(tour.steps[0].target);
            console.log(`[OnboardingProvider] Target: ${tour.steps[0].target} →`, firstTarget ? '✅ FOUND' : '❌ NOT FOUND');
            
            if (firstTarget) {
              console.log('[OnboardingProvider] 🚀 Starting tour:', tourId);
              startTour(tourId);
            } else if (attempt < maxAttempts) {
              // Retry with exponential backoff (max 2s between attempts)
              const delay = Math.min(attempt * 500, 2000);
              console.log(`[OnboardingProvider] ⏳ Retrying in ${delay}ms...`);
              setTimeout(() => tryStartTour(attempt + 1, maxAttempts), delay);
            } else {
              console.warn('[OnboardingProvider] ⚠️ Tour auto-start cancelled - element not ready. Use Help Center to start manually.');
            }
          }
        };
        
        // Start first attempt after 2s to ensure DOM is fully rendered
        setTimeout(() => tryStartTour(1, 8), 2000);
      }
    }
  }, [pathname, currentTour, startTour, resetTour, completedTours, skippedTours]);

  const tour = currentTour ? getTour(currentTour) : null;

  console.log('[OnboardingProvider] Render', { 
    currentTour, 
    tour: tour?.name, 
    currentStep,
    shouldRenderCoachMarks: !!tour
  });

  return (
    <>
      {children}
      {tour && (
        <CoachMarks
          steps={tour.steps}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
          onComplete={completeTour}
          tourName={tour.name}
        />
      )}
    </>
  );
}
