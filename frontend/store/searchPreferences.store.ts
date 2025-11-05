import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchFilters } from '@/types/search.types';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface SearchPreferencesState {
  savedSearches: SavedSearch[];
  recentQueries: string[];
  defaultSort: {
    sortField: string;
    sortOrder: 'asc' | 'desc';
  };
  lastUsedFilters: SearchFilters;
  presetUsageStats: Record<string, number>;

  // Actions
  addSavedSearch: (name: string, query: string, filters: SearchFilters) => void;
  updateSavedSearch: (id: string, name: string, query: string, filters: SearchFilters) => void;
  removeSavedSearch: (id: string) => void;
  applySavedSearch: (id: string) => SavedSearch | null;
  addRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
  setDefaultSort: (sortField: string, sortOrder: 'asc' | 'desc') => void;
  setLastUsedFilters: (filters: SearchFilters) => void;
  trackPresetUsage: (presetId: string) => void;
  getPresetUsageCount: (presetId: string) => number;
}

export const useSearchPreferences = create<SearchPreferencesState>()(
  persist(
    (set, get) => ({
      savedSearches: [],
      recentQueries: [],
      defaultSort: {
        sortField: 'documentDate',
        sortOrder: 'desc',
      },
      lastUsedFilters: {},
      presetUsageStats: {},

      addSavedSearch: (name, query, filters) => {
        const newSearch: SavedSearch = {
          id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          query,
          filters,
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };

        set((state) => ({
          savedSearches: [...state.savedSearches, newSearch],
        }));
      },

      updateSavedSearch: (id, name, query, filters) => {
        set((state) => ({
          savedSearches: state.savedSearches.map((search) =>
            search.id === id
              ? { ...search, name: name.trim(), query, filters }
              : search
          ),
        }));
      },

      removeSavedSearch: (id) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter((search) => search.id !== id),
        }));
      },

      applySavedSearch: (id) => {
        const search = get().savedSearches.find((s) => s.id === id);
        if (!search) return null;

        set((state) => ({
          savedSearches: state.savedSearches.map((s) =>
            s.id === id
              ? {
                  ...s,
                  lastUsed: new Date().toISOString(),
                  usageCount: s.usageCount + 1,
                }
              : s
          ),
        }));

        return search;
      },

      addRecentQuery: (query) => {
        const trimmedQuery = query.trim();
        
        // Ignore empty queries or very short ones
        if (!trimmedQuery || trimmedQuery.length < 2) {
          return;
        }

        set((state) => {
          const filtered = state.recentQueries.filter((q) => q !== trimmedQuery);
          const updated = [trimmedQuery, ...filtered].slice(0, 5);
          return { recentQueries: updated };
        });
      },

      clearRecentQueries: () => {
        set({ recentQueries: [] });
      },

      setDefaultSort: (sortField, sortOrder) => {
        set({ defaultSort: { sortField, sortOrder } });
      },

      setLastUsedFilters: (filters) => {
        set({ lastUsedFilters: filters });
      },

      trackPresetUsage: (presetId) => {
        set((state) => ({
          presetUsageStats: {
            ...state.presetUsageStats,
            [presetId]: (state.presetUsageStats[presetId] || 0) + 1,
          },
        }));
      },

      getPresetUsageCount: (presetId) => {
        return get().presetUsageStats[presetId] || 0;
      },
    }),
    {
      name: 'sad-search-preferences',
    }
  )
);
