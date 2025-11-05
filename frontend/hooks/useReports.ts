import { useState, useCallback } from 'react';
import { reportsApi } from '@/lib/api/reports';
import {
  DocumentReportData,
  UserActivityReportData,
  SignatureReportData,
  ReportFilters,
  ReportType,
  ExportFormat,
} from '@/types/report.types';
import { toast, reportToastMessages } from '@/lib/toast';
import { useReportsCache } from '@/store/reportsCache.store';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [documentReport, setDocumentReport] = useState<DocumentReportData | null>(null);
  const [activityReport, setActivityReport] = useState<UserActivityReportData | null>(null);
  const [signatureReport, setSignatureReport] = useState<SignatureReportData | null>(null);

  // Cache integration
  const {
    getCachedDocumentReport,
    getCachedActivityReport,
    getCachedSignatureReport,
    cacheDocumentReport,
    cacheActivityReport,
    cacheSignatureReport,
  } = useReportsCache();

  const fetchDocumentReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedDocumentReport(filters);
      if (cached) {
        console.log('[useReports] Using cached document report');
        setDocumentReport(cached);
        toast.success('Reporte obtenido desde caché');
        return cached;
      }

      // Cache miss - fetch from API
      const response = await reportsApi.getDocumentReport(filters);

      if (!response || !response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      setDocumentReport(response.data.data);
      
      // Cache the result
      cacheDocumentReport(filters, response.data.data);
      
      toast.success(reportToastMessages.reportGenerated);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al generar reporte de documentos:', error);
      
      let errorMessage = 'Error al generar reporte de documentos';
      
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
          errorMessage = axiosError.response?.data?.message || `Error del servidor (${axiosError.response?.status})`;
        } else if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        }
      }
      
      toast.error(reportToastMessages.reportGenerationError);
      setDocumentReport(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserActivityReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedActivityReport(filters);
      if (cached) {
        console.log('[useReports] Using cached activity report');
        setActivityReport(cached);
        toast.success('Reporte obtenido desde caché');
        return cached;
      }

      // Cache miss - fetch from API
      const response = await reportsApi.getUserActivityReport(filters);

      if (!response || !response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      setActivityReport(response.data.data);
      
      // Cache the result
      cacheActivityReport(filters, response.data.data);
      
      toast.success(reportToastMessages.reportGenerated);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al generar reporte de actividad:', error);
      
      let errorMessage = 'Error al generar reporte de actividad';
      
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
          errorMessage = axiosError.response?.data?.message || `Error del servidor (${axiosError.response?.status})`;
        } else if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        }
      }
      
      toast.error(reportToastMessages.reportGenerationError);
      setActivityReport(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSignatureReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedSignatureReport(filters);
      if (cached) {
        console.log('[useReports] Using cached signature report');
        setSignatureReport(cached);
        toast.success('Reporte obtenido desde caché');
        return cached;
      }

      // Cache miss - fetch from API
      const response = await reportsApi.getSignatureReport(filters);

      if (!response || !response.data) {
        throw new Error('Respuesta vacía del servidor');
      }

      setSignatureReport(response.data.data);
      
      // Cache the result
      cacheSignatureReport(filters, response.data.data);
      
      toast.success(reportToastMessages.reportGenerated);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error al generar reporte de firmas:', error);
      
      let errorMessage = 'Error al generar reporte de firmas';
      
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
          errorMessage = axiosError.response?.data?.message || `Error del servidor (${axiosError.response?.status})`;
        } else if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        }
      }
      
      toast.error(reportToastMessages.reportGenerationError);
      setSignatureReport(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(
    async (type: ReportType, filters: ReportFilters = {}, format: ExportFormat) => {
      try {
        setExporting(true);

        let response;
        let fileName = '';

        switch (type) {
          case 'documents':
            response = await reportsApi.exportDocumentReport(filters, format);
            fileName = `reporte-documentos-${new Date().toISOString().split('T')[0]}.${format}`;
            break;
          case 'activity':
            response = await reportsApi.exportUserActivityReport(filters, format);
            fileName = `reporte-actividad-${new Date().toISOString().split('T')[0]}.${format}`;
            break;
          case 'signatures':
            response = await reportsApi.exportSignatureReport(filters, format);
            fileName = `reporte-firmas-${new Date().toISOString().split('T')[0]}.${format}`;
            break;
          default:
            throw new Error('Tipo de reporte no válido');
        }

        const blob = response.data as unknown as Blob;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success(reportToastMessages.reportExported(format));
      } catch (error: unknown) {
        console.error('Error al exportar reporte:', error);
        
        let errorMessage = 'Error al exportar reporte';
        
        if (error && typeof error === 'object') {
          if ('response' in error) {
            const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
            errorMessage = axiosError.response?.data?.message || `Error del servidor (${axiosError.response?.status})`;
          } else if ('message' in error) {
            errorMessage = (error as { message: string }).message;
          }
        }
        
        toast.error(reportToastMessages.exportError(format));
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const clearReports = useCallback(() => {
    setDocumentReport(null);
    setActivityReport(null);
    setSignatureReport(null);
  }, []);

  return {
    loading,
    exporting,
    documentReport,
    activityReport,
    signatureReport,
    fetchDocumentReport,
    fetchUserActivityReport,
    fetchSignatureReport,
    exportReport,
    clearReports,
  };
}
