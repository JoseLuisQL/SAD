'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditDetailModal } from '@/components/audit/AuditDetailModal';
import { AuditAnalyticsDashboard } from '@/components/audit/AuditAnalyticsDashboard';
import { AnomaliesPanel } from '@/components/audit/AnomaliesPanel';
import { SecurityAlertsPanel } from '@/components/audit/SecurityAlertsPanel';
import { CustomReportGenerator } from '@/components/audit/CustomReportGenerator';
import { useAudit } from '@/hooks/useAudit';
import { AuditLog, AuditLogsFilters } from '@/types/audit.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditoriaPage() {
  const { logs, loading, pagination, fetchLogs, fetchStats } = useAudit();
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentFilters, setCurrentFilters] = useState<AuditLogsFilters>({ page: 1, limit: 10 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs(currentFilters);
    fetchStats();
  }, [fetchLogs, fetchStats, currentFilters]);

  const openDetailModal = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedLog(null);
  };

  const handleFilter = (filters: AuditLogsFilters) => {
    setCurrentFilters({ ...filters, page: 1, limit: pagination.limit });
  };

  const handleClearFilters = () => {
    setCurrentFilters({ page: 1, limit: pagination.limit });
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters({ ...currentFilters, page });
  };

  const handleLimitChange = (limit: number) => {
    setCurrentFilters({ ...currentFilters, page: 1, limit });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchLogs(currentFilters),
      fetchStats()
    ]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const tabConfig = [
    { 
      value: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Vista general y métricas'
    },
    { 
      value: 'logs', 
      label: 'Registros', 
      icon: FileText,
      description: 'Historial de actividades',
      badge: pagination.total > 0 ? pagination.total : undefined
    },
    { 
      value: 'anomalies', 
      label: 'Anomalías', 
      icon: AlertTriangle,
      description: 'Patrones inusuales'
    },
    { 
      value: 'alerts', 
      label: 'Alertas', 
      icon: ShieldAlert,
      description: 'Notificaciones de seguridad'
    },
    { 
      value: 'reports', 
      label: 'Reportes', 
      icon: FileText,
      description: 'Generador de informes'
    },
  ];

  return (
    <main id="main-content" className="space-y-6" role="main" aria-label="Auditoría del Sistema">
      {/* Skip link for accessibility */}
      <a
        href="#audit-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
      >
        Saltar al contenido de auditoría
      </a>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Link 
          href="/dashboard" 
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link 
          href="/dashboard/admin" 
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          Administración
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-gray-900 dark:text-white font-medium" aria-current="page">Auditoría</span>
      </nav>

      {/* Header mejorado */}
      <header className="flex items-center justify-between" data-tour="auditoria-header">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30" aria-hidden="true">
            <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Auditoría del Sistema
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Monitoreo avanzado, analytics y seguridad del sistema
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3" data-tour="auditoria-export">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Actualizado: {lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            )}
            Actualizar
          </Button>
        </div>
      </header>

      {/* Tabs mejorados */}
      <div id="audit-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList 
            className="grid w-full grid-cols-5 h-auto p-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl"
            aria-label="Secciones de auditoría"
          >
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`${tab.label}: ${tab.description}`}
                >
                  <IconComponent className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 h-5 min-w-[20px] text-xs bg-gray-200 dark:bg-slate-700"
                    >
                      {tab.badge > 999 ? '999+' : tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <section aria-label="Dashboard de auditoría">
              <AuditAnalyticsDashboard />
            </section>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            <section aria-label="Filtros de registros">
              <AuditFilters
                onFilter={handleFilter}
                onClear={handleClearFilters}
                loading={loading}
              />
            </section>

            <section aria-label="Tabla de registros de auditoría" data-tour="auditoria-table">
              <div role="status" aria-live="polite" aria-busy={loading}>
                {loading && <p className="sr-only">Cargando registros de auditoría...</p>}
              </div>
              <AuditTable
                logs={logs}
                loading={loading}
                pagination={pagination}
                onViewDetails={openDetailModal}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </section>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-6 mt-6">
            <section aria-label="Panel de anomalías detectadas">
              <AnomaliesPanel onViewDetails={(anomaly) => console.log('View anomaly:', anomaly)} />
            </section>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            <section aria-label="Panel de alertas de seguridad">
              <SecurityAlertsPanel onViewDetails={(alert) => console.log('View alert:', alert)} />
            </section>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <section aria-label="Generador de reportes personalizados">
              <CustomReportGenerator />
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Detalle */}
      <AuditDetailModal
        log={selectedLog}
        open={detailModalOpen}
        onClose={closeDetailModal}
      />
    </main>
  );
}
