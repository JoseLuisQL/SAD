import { SearchFilters } from '@/types/search.types';
import { FileText, FileCheck, AlertCircle, Calendar, Clock } from 'lucide-react';

export interface SearchPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: SearchFilters;
  query?: string;
}

export const searchPresets: SearchPreset[] = [
  {
    id: 'signed-this-week',
    name: 'Firmados esta semana',
    description: 'Documentos con firma digital de los últimos 7 días',
    icon: FileCheck,
    filters: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    query: 'firmado',
  },
  {
    id: 'pending-ocr',
    name: 'Pendientes de OCR',
    description: 'Documentos sin procesamiento OCR completado',
    icon: AlertCircle,
    filters: {},
    query: 'OCR:pending',
  },
  {
    id: 'oficios-recent',
    name: 'Oficios recientes',
    description: 'Oficios del último mes',
    icon: FileText,
    filters: {
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    query: 'oficio',
  },
  {
    id: 'this-month',
    name: 'Documentos del mes',
    description: 'Todos los documentos creados este mes',
    icon: Calendar,
    filters: {
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    },
  },
  {
    id: 'recent-activity',
    name: 'Actividad reciente',
    description: 'Documentos modificados en las últimas 24 horas',
    icon: Clock,
    filters: {
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  },
];

export function getPresetById(id: string): SearchPreset | undefined {
  return searchPresets.find(preset => preset.id === id);
}

export function getPopularPresets(usageStats: Record<string, number>, limit: number = 3): SearchPreset[] {
  return searchPresets
    .sort((a, b) => (usageStats[b.id] || 0) - (usageStats[a.id] || 0))
    .slice(0, limit);
}
