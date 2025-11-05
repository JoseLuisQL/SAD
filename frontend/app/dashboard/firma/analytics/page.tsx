'use client';

import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import MetricsCards from '@/components/firma/analytics/MetricsCards';
import SignatureTrendChart from '@/components/firma/analytics/SignatureTrendChart';
import DistributionChart from '@/components/firma/analytics/DistributionChart';
import TopSignersTable from '@/components/firma/analytics/TopSignersTable';
import ActivityTimeline from '@/components/firma/analytics/ActivityTimeline';
import AnalyticsFilters from '@/components/firma/analytics/AnalyticsFilters';
import ExportReportModal from '@/components/firma/analytics/ExportReportModal';
import { BarChart3, RefreshCw, HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';

interface Metrics {
  totalSignatures: number;
  averagePerDay: number;
  documentsSigned: number;
  documentsUnsigned: number;
  adoptionRate: number;
  averageFlowCompletionTime: number;
  totalReversions: number;
  pendingFlows: number;
}

interface TrendData {
  period: string;
  count: number;
  date: string;
}

interface DistributionData {
  documentType: string;
  count: number;
  percentage: number;
}

interface TopSigner {
  userId: string;
  userName: string;
  userEmail: string;
  totalSignatures: number;
  documentsCount: number;
  lastSignatureDate: Date | null;
}

export default function AnalyticsPage() {
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [topSigners, setTopSigners] = useState<TopSigner[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { startTour, resetTour } = useOnboarding();

  useEffect(() => {
    loadAnalytics();
    
    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dateFrom, dateTo]);

  const loadAnalytics = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      };

      const [metricsRes, trendRes, distributionRes, topSignersRes] = await Promise.all([
        api.get('/firma/analytics/metrics', { params }),
        api.get('/firma/analytics/by-period', { params: { ...params, period: 'day' } }),
        api.get('/firma/analytics/document-types', { params }),
        api.get('/firma/analytics/by-user', { params: { ...params, limit: 10 } }),
      ]);

      setMetrics(metricsRes.data);
      setTrendData(trendRes.data || []);
      setDistributionData(distributionRes.data || []);
      setTopSigners(topSignersRes.data || []);
    } catch (error: unknown) {
      console.error('Error loading analytics:', error);
      if (!silent) {
        toast.error('Error al cargar las analíticas');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (from: Date, to: Date) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  const handleStartTour = () => {
    resetTour('firma-analytics-tour');
    setTimeout(() => {
      startTour('firma-analytics-tour');
    }, 100);
  };

  return (
    <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between" data-tour="firma-analytics-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analítica de Firma Digital</h1>
              <p className="text-base text-gray-600 dark:text-slate-400">
                Métricas y estadísticas de uso del sistema de firma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartTour}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Iniciar Tour
            </Button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div data-tour="firma-analytics-filters">
          <AnalyticsFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateRangeChange={handleDateRangeChange}
            onExport={() => setShowExportModal(true)}
          />
        </div>

        {/* Metrics Cards */}
        <div data-tour="firma-analytics-metrics">
          <MetricsCards metrics={metrics || {
          totalSignatures: 0,
          averagePerDay: 0,
          documentsSigned: 0,
          documentsUnsigned: 0,
          adoptionRate: 0,
          averageFlowCompletionTime: 0,
          totalReversions: 0,
          pendingFlows: 0,
        }} loading={loading} />
        </div>

        {/* Trend Chart */}
        <div data-tour="firma-analytics-trend">
          <SignatureTrendChart data={trendData} loading={loading} />
        </div>

        {/* Distribution and Top Signers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="firma-analytics-charts">
          <DistributionChart data={distributionData} loading={loading} />
          <TopSignersTable data={topSigners} loading={loading} />
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline dateFrom={dateFrom} dateTo={dateTo} />

        {/* Export Modal */}
        <ExportReportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>
    </div>
  );
}
