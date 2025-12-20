'use client';

import { useState, useEffect } from 'react';
import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import MetricsCards from '@/components/firma/analytics/MetricsCards';
import SignatureTrendChart from '@/components/firma/analytics/SignatureTrendChart';
import DistributionChart from '@/components/firma/analytics/DistributionChart';
import TopSignersTable from '@/components/firma/analytics/TopSignersTable';
import ActivityTimeline from '@/components/firma/analytics/ActivityTimeline';
import AnalyticsFilters from '@/components/firma/analytics/AnalyticsFilters';
import { BarChart3, RefreshCw, HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

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

const defaultMetrics: Metrics = {
  totalSignatures: 0,
  averagePerDay: 0,
  documentsSigned: 0,
  documentsUnsigned: 0,
  adoptionRate: 0,
  averageFlowCompletionTime: 0,
  totalReversions: 0,
  pendingFlows: 0,
};

export default function AnalyticsPage() {
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData[]>([]);
  const [topSigners, setTopSigners] = useState<TopSigner[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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
        toast.error('Error al cargar las analiticas');
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
        {/* Header con contexto dinamico */}
        <div className="flex items-center justify-between" data-tour="firma-analytics-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl">
              <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Analitica de Firma Digital
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {format(dateFrom, "dd MMM", { locale: es })} - {format(dateTo, "dd MMM yyyy", { locale: es })}
                <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {metrics?.totalSignatures?.toLocaleString() || 0} firmas totales
                </span>
              </p>
            </div>
          </div>
          
          {/* Botones con jerarquia clara */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartTour}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              aria-label="Iniciar tour de ayuda"
              title="Ver guia interactiva"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
              aria-label="Actualizar datos"
              title="Actualizar metricas"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters - Ya incluye exportacion */}
        <div data-tour="firma-analytics-filters">
          <AnalyticsFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateRangeChange={handleDateRangeChange}
            onExport={() => {}}
          />
        </div>

        {/* Metrics Cards */}
        <div data-tour="firma-analytics-metrics">
          <MetricsCards metrics={metrics || defaultMetrics} loading={loading} />
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
        <div data-tour="firma-analytics-activity">
          <ActivityTimeline dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>
    </div>
  );
}
