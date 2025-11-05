import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReportFilters, ReportType } from '@/types/report.types';
import { subDays, subMonths } from 'date-fns';

export type FilterPreset = 'last-week' | 'last-month' | 'custom';

export interface SavedFilterPreset {
  id: string;
  name: string;
  preset: FilterPreset;
  reportType: ReportType;
  filters: ReportFilters;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface UserPreferencesState {
  savedPresets: SavedFilterPreset[];
  lastUsedReportType: ReportType;
  defaultPreset: FilterPreset;
  presetUsageStats: Record<FilterPreset, number>;

  // Actions
  savePreset: (name: string, preset: FilterPreset, reportType: ReportType, filters: ReportFilters, dateFrom: string, dateTo: string) => void;
  updatePreset: (id: string, name: string, filters: ReportFilters, dateFrom: string, dateTo: string) => void;
  removePreset: (id: string) => void;
  applyPreset: (id: string) => SavedFilterPreset | null;
  setLastUsedReportType: (reportType: ReportType) => void;
  setDefaultPreset: (preset: FilterPreset) => void;
  trackPresetUsage: (preset: FilterPreset) => void;
  getPresetUsageCount: (preset: FilterPreset) => number;
  getPresetDates: (preset: FilterPreset) => { dateFrom: Date; dateTo: Date };
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      savedPresets: [],
      lastUsedReportType: 'documents',
      defaultPreset: 'last-month',
      presetUsageStats: {
        'last-week': 0,
        'last-month': 0,
        'custom': 0,
      },

      savePreset: (name, preset, reportType, filters, dateFrom, dateTo) => {
        const newPreset: SavedFilterPreset = {
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          preset,
          reportType,
          filters,
          dateFrom,
          dateTo,
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };

        set((state) => ({
          savedPresets: [...state.savedPresets, newPreset],
        }));
      },

      updatePreset: (id, name, filters, dateFrom, dateTo) => {
        set((state) => ({
          savedPresets: state.savedPresets.map((preset) =>
            preset.id === id
              ? { ...preset, name: name.trim(), filters, dateFrom, dateTo }
              : preset
          ),
        }));
      },

      removePreset: (id) => {
        set((state) => ({
          savedPresets: state.savedPresets.filter((preset) => preset.id !== id),
        }));
      },

      applyPreset: (id) => {
        const preset = get().savedPresets.find((p) => p.id === id);
        if (!preset) return null;

        set((state) => ({
          savedPresets: state.savedPresets.map((p) =>
            p.id === id
              ? {
                  ...p,
                  lastUsed: new Date().toISOString(),
                  usageCount: p.usageCount + 1,
                }
              : p
          ),
        }));

        return preset;
      },

      setLastUsedReportType: (reportType) => {
        set({ lastUsedReportType: reportType });
      },

      setDefaultPreset: (preset) => {
        set({ defaultPreset: preset });
      },

      trackPresetUsage: (preset) => {
        set((state) => ({
          presetUsageStats: {
            ...state.presetUsageStats,
            [preset]: (state.presetUsageStats[preset] || 0) + 1,
          },
        }));
      },

      getPresetUsageCount: (preset) => {
        return get().presetUsageStats[preset] || 0;
      },

      getPresetDates: (preset) => {
        const today = new Date();
        
        switch (preset) {
          case 'last-week':
            return {
              dateFrom: subDays(today, 7),
              dateTo: today,
            };
          case 'last-month':
            return {
              dateFrom: subMonths(today, 1),
              dateTo: today,
            };
          case 'custom':
          default:
            return {
              dateFrom: subMonths(today, 1),
              dateTo: today,
            };
        }
      },
    }),
    {
      name: 'sad-user-preferences',
    }
  )
);
