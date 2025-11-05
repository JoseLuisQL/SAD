import api from '../api';
import {
  AuditLogsResponse,
  AuditLogResponse,
  AuditStatsResponse,
  AuditLogsFilters,
  AdvancedAnalyticsResponse,
  AnomaliesResponse,
  UserActivityPatternResponse,
  SecurityAlertsResponse,
  CustomReportResponse,
  CustomReportFilters
} from '@/types/audit.types';

export const auditApi = {
  getAll: (params: AuditLogsFilters = {}) => {
    return api.get<AuditLogsResponse>('/audit', { params });
  },

  getById: (id: string) => {
    return api.get<AuditLogResponse>(`/audit/${id}`);
  },

  getStats: () => {
    return api.get<AuditStatsResponse>('/audit/stats');
  },

  getAdvancedAnalytics: (params?: { dateFrom?: string; dateTo?: string }) => {
    return api.get<AdvancedAnalyticsResponse>('/audit/analytics/advanced', { params });
  },

  getAnomalies: (params?: { 
    offHoursStart?: number; 
    offHoursEnd?: number;
    maxFailedLogins?: number;
    maxDeletionsPerHour?: number;
  }) => {
    return api.get<AnomaliesResponse>('/audit/analytics/anomalies', { params });
  },

  getUserPattern: (userId: string, params?: { dateFrom?: string; dateTo?: string }) => {
    return api.get<UserActivityPatternResponse>(`/audit/analytics/user/${userId}/pattern`, { params });
  },

  getSecurityAlerts: () => {
    return api.get<SecurityAlertsResponse>('/audit/security/alerts');
  },

  generateCustomReport: (filters: CustomReportFilters) => {
    return api.post<CustomReportResponse>('/audit/reports/custom', filters);
  },
};
