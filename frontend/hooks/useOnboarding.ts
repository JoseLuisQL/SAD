'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, CoachMarkTour } from '@/types/onboarding.types';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface OnboardingStore extends OnboardingState {
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: (tourId: string) => void;
  setShowOnboarding: (show: boolean) => void;
  syncWithBackend: () => Promise<void>;
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      completedTours: [],
      skippedTours: [],
      currentTour: null,
      currentStep: 0,
      showOnboarding: true,

      startTour: (tourId: string) => {
        set({
          currentTour: tourId,
          currentStep: 0,
        });
      },

      nextStep: () => {
        set((state) => ({
          currentStep: state.currentStep + 1,
        }));
      },

      previousStep: () => {
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        }));
      },

      skipTour: () => {
        const { currentTour, skippedTours } = get();
        if (currentTour && !skippedTours.includes(currentTour)) {
          set({
            skippedTours: [...skippedTours, currentTour],
            currentTour: null,
            currentStep: 0,
          });
          // Backend sync disabled temporarily - only using localStorage
          // get().syncWithBackend();
        } else {
          set({
            currentTour: null,
            currentStep: 0,
          });
        }
      },

      completeTour: () => {
        const { currentTour, completedTours } = get();
        if (currentTour && !completedTours.includes(currentTour)) {
          set({
            completedTours: [...completedTours, currentTour],
            currentTour: null,
            currentStep: 0,
          });
          // Backend sync disabled temporarily - only using localStorage
          // get().syncWithBackend();
        } else {
          set({
            currentTour: null,
            currentStep: 0,
          });
        }
      },

      resetTour: (tourId: string) => {
        set((state) => ({
          completedTours: state.completedTours.filter((id) => id !== tourId),
          skippedTours: state.skippedTours.filter((id) => id !== tourId),
        }));
        // Backend sync disabled temporarily - only using localStorage
        // get().syncWithBackend();
      },

      setShowOnboarding: (show: boolean) => {
        set({ showOnboarding: show });
      },

      syncWithBackend: async () => {
        try {
          const { completedTours, skippedTours } = get();
          const token = Cookies.get('access_token');
          
          if (!token) {
            // No token - working in offline mode, this is OK
            return;
          }

          await axios.post(
            `${API_URL}/users/onboarding`,
            {
              completedTours,
              skippedTours,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log('[Onboarding] ✅ Synced with backend successfully');
        } catch (error) {
          // Silently fail - onboarding works without backend sync
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Auth error - ignore, user can continue using onboarding
            return;
          }
          // Other errors - also ignore
          return;
        }
      },
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        completedTours: state.completedTours,
        skippedTours: state.skippedTours,
        showOnboarding: state.showOnboarding,
      }),
    }
  )
);

export function useTourStatus(tourId: string) {
  const { completedTours, skippedTours } = useOnboarding();
  
  return {
    isCompleted: completedTours.includes(tourId),
    isSkipped: skippedTours.includes(tourId),
    shouldShow: !completedTours.includes(tourId) && !skippedTours.includes(tourId),
  };
}
