import api from '../api';
import {
  DocumentReportData,
  UserActivityReportData,
  SignatureReportData,
  ReportFilters,
  ExportFormat,
  ReportResponse,
} from '@/types/report.types';

export const reportsApi = {
  getDocumentReport: (filters: ReportFilters = {}) => {
    return api.get<ReportResponse<DocumentReportData>>('/reports/documents', {
      params: filters,
    });
  },

  getUserActivityReport: (filters: ReportFilters = {}) => {
    return api.get<ReportResponse<UserActivityReportData>>('/reports/activity', {
      params: filters,
    });
  },

  getSignatureReport: (filters: ReportFilters = {}) => {
    return api.get<ReportResponse<SignatureReportData>>('/reports/signatures', {
      params: filters,
    });
  },

  exportDocumentReport: (filters: ReportFilters = {}, format: ExportFormat) => {
    return api.get('/reports/documents/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
  },

  exportUserActivityReport: (filters: ReportFilters = {}, format: ExportFormat) => {
    return api.get('/reports/activity/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
  },

  exportSignatureReport: (filters: ReportFilters = {}, format: ExportFormat) => {
    return api.get('/reports/signatures/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
  },
};
