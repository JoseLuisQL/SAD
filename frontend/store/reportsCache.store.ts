import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  DocumentReport, 
  UserActivityReport, 
  SignatureReport,
  ReportFilters 
} from '@/types/report.types';

interface CachedReport<T> {
  data: T;
  timestamp: number;
  filters: ReportFilters;
}

interface ReportsCacheState {
  // Cache TTL in milliseconds (default: 5 minutes)
  cacheTTL: number;
  
  // Cached reports
  documentReports: Record<string, CachedReport<DocumentReport>>;
  activityReports: Record<string, CachedReport<UserActivityReport>>;
  signatureReports: Record<string, CachedReport<SignatureReport>>;
  
  // Actions
  setCacheTTL: (ttl: number) => void;
  getCachedDocumentReport: (filters: ReportFilters) => DocumentReport | null;
  getCachedActivityReport: (filters: ReportFilters) => UserActivityReport | null;
  getCachedSignatureReport: (filters: ReportFilters) => SignatureReport | null;
  cacheDocumentReport: (filters: ReportFilters, data: DocumentReport) => void;
  cacheActivityReport: (filters: ReportFilters, data: UserActivityReport) => void;
  cacheSignatureReport: (filters: ReportFilters, data: SignatureReport) => void;
  invalidateCache: () => void;
  invalidateReportType: (type: 'documents' | 'activity' | 'signatures') => void;
}

// Generate cache key from filters
const generateCacheKey = (filters: ReportFilters): string => {
  return JSON.stringify({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    periodId: filters.periodId,
    officeId: filters.officeId,
    documentTypeId: filters.documentTypeId,
    userId: filters.userId,
    action: filters.action,
    signerId: filters.signerId,
    status: filters.status,
  });
};

// Check if cache is still valid
const isCacheValid = (timestamp: number, ttl: number): boolean => {
  return Date.now() - timestamp < ttl;
};

export const useReportsCache = create<ReportsCacheState>()(
  persist(
    (set, get) => ({
      cacheTTL: 5 * 60 * 1000, // 5 minutes default
      documentReports: {},
      activityReports: {},
      signatureReports: {},

      setCacheTTL: (ttl: number) => {
        set({ cacheTTL: ttl });
      },

      getCachedDocumentReport: (filters: ReportFilters) => {
        const key = generateCacheKey(filters);
        const cached = get().documentReports[key];
        
        if (!cached) {
          console.log('[ReportsCache] Document report cache MISS', key);
          return null;
        }

        if (!isCacheValid(cached.timestamp, get().cacheTTL)) {
          console.log('[ReportsCache] Document report cache EXPIRED', key);
          // Remove expired cache
          set((state) => {
            const newCache = { ...state.documentReports };
            delete newCache[key];
            return { documentReports: newCache };
          });
          return null;
        }

        console.log('[ReportsCache] Document report cache HIT', key);
        return cached.data;
      },

      getCachedActivityReport: (filters: ReportFilters) => {
        const key = generateCacheKey(filters);
        const cached = get().activityReports[key];
        
        if (!cached) {
          console.log('[ReportsCache] Activity report cache MISS', key);
          return null;
        }

        if (!isCacheValid(cached.timestamp, get().cacheTTL)) {
          console.log('[ReportsCache] Activity report cache EXPIRED', key);
          set((state) => {
            const newCache = { ...state.activityReports };
            delete newCache[key];
            return { activityReports: newCache };
          });
          return null;
        }

        console.log('[ReportsCache] Activity report cache HIT', key);
        return cached.data;
      },

      getCachedSignatureReport: (filters: ReportFilters) => {
        const key = generateCacheKey(filters);
        const cached = get().signatureReports[key];
        
        if (!cached) {
          console.log('[ReportsCache] Signature report cache MISS', key);
          return null;
        }

        if (!isCacheValid(cached.timestamp, get().cacheTTL)) {
          console.log('[ReportsCache] Signature report cache EXPIRED', key);
          set((state) => {
            const newCache = { ...state.signatureReports };
            delete newCache[key];
            return { signatureReports: newCache };
          });
          return null;
        }

        console.log('[ReportsCache] Signature report cache HIT', key);
        return cached.data;
      },

      cacheDocumentReport: (filters: ReportFilters, data: DocumentReport) => {
        const key = generateCacheKey(filters);
        console.log('[ReportsCache] Caching document report', key);
        set((state) => ({
          documentReports: {
            ...state.documentReports,
            [key]: {
              data,
              timestamp: Date.now(),
              filters,
            },
          },
        }));
      },

      cacheActivityReport: (filters: ReportFilters, data: UserActivityReport) => {
        const key = generateCacheKey(filters);
        console.log('[ReportsCache] Caching activity report', key);
        set((state) => ({
          activityReports: {
            ...state.activityReports,
            [key]: {
              data,
              timestamp: Date.now(),
              filters,
            },
          },
        }));
      },

      cacheSignatureReport: (filters: ReportFilters, data: SignatureReport) => {
        const key = generateCacheKey(filters);
        console.log('[ReportsCache] Caching signature report', key);
        set((state) => ({
          signatureReports: {
            ...state.signatureReports,
            [key]: {
              data,
              timestamp: Date.now(),
              filters,
            },
          },
        }));
      },

      invalidateCache: () => {
        console.log('[ReportsCache] Invalidating all caches');
        set({
          documentReports: {},
          activityReports: {},
          signatureReports: {},
        });
      },

      invalidateReportType: (type: 'documents' | 'activity' | 'signatures') => {
        console.log('[ReportsCache] Invalidating cache for', type);
        switch (type) {
          case 'documents':
            set({ documentReports: {} });
            break;
          case 'activity':
            set({ activityReports: {} });
            break;
          case 'signatures':
            set({ signatureReports: {} });
            break;
        }
      },
    }),
    {
      name: 'reports-cache-storage',
      partialize: (state) => ({
        cacheTTL: state.cacheTTL,
        documentReports: state.documentReports,
        activityReports: state.activityReports,
        signatureReports: state.signatureReports,
      }),
    }
  )
);
