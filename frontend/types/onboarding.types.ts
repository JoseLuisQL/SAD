export interface CoachMarkStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  highlightPadding?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface CoachMarkTour {
  id: string;
  name: string;
  description: string;
  steps: CoachMarkStep[];
  module: 'archivadores' | 'documentos' | 'expedientes' | 'busqueda' | 'general' | 'firma' | 'reportes' | 'configuracion';
}

export interface OnboardingState {
  completedTours: string[];
  skippedTours: string[];
  currentTour: string | null;
  currentStep: number;
  showOnboarding: boolean;
}

export interface UserOnboardingPreferences {
  userId: number;
  completedTours: string[];
  skippedTours: string[];
  lastUpdated: Date;
}
