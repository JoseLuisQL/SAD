'use client';

import { useEffect, useState } from 'react';
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
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function AuditoriaPage() {
  const { logs, stats, loading, pagination, fetchLogs, fetchStats } = useAudit();
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentFilters, setCurrentFilters] = useState<AuditLogsFilters>({ page: 1, limit: 10 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

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

  const handleRefresh = () => {
    fetchLogs(currentFilters);
    fetchStats();
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Auditoría del Sistema
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Sistema avanzado de monitoreo, analytics y seguridad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 dark:text-slate-300">Desde:</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto"
              />
              <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 dark:text-slate-300">Hasta:</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pagination.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalías
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AuditAnalyticsDashboard dateFrom={dateFrom} dateTo={dateTo} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AuditFilters
            onFilter={handleFilter}
            onClear={handleClearFilters}
            loading={loading}
          />

          <AuditTable
            logs={logs}
            loading={loading}
            pagination={pagination}
            onViewDetails={openDetailModal}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <AnomaliesPanel onViewDetails={(anomaly) => console.log('View anomaly:', anomaly)} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SecurityAlertsPanel onViewDetails={(alert) => console.log('View alert:', alert)} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <CustomReportGenerator />
        </TabsContent>
      </Tabs>

      <AuditDetailModal
        log={selectedLog}
        open={detailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}
