'use client';

import React, { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useOffices } from '@/hooks/useOffices';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { 
  FileText, 
  FolderOpen, 
  Archive, 
  FileCheck,
  FileWarning,
  FileClock,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SignatureDonut } from '@/components/dashboard/SignatureDonut';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const rangeLabels = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { hasPermission, hasModule } = usePermissions();
  const { offices } = useOffices();
  const { data, isLoading, error, range, officeId, setRange, setOfficeId, refresh } = useDashboardMetrics();

  // Verificar permisos para mostrar selectores de oficina
  const canViewOffices = useMemo(() => hasPermission('offices', 'view'), [hasPermission]);
  
  // Verificar permisos para cada sección del dashboard
  const canViewDocuments = useMemo(() => hasModule('documents'), [hasModule]);
  const canViewArchivadores = useMemo(() => hasModule('archivadores'), [hasModule]);
  const canViewExpedientes = useMemo(() => hasModule('expedientes'), [hasModule]);
  const canViewSignatures = useMemo(() => hasModule('signing') || hasModule('signatureFlows'), [hasModule]);
  const canViewAnalytics = useMemo(() => hasModule('analytics'), [hasModule]);
  const canViewAudit = useMemo(() => hasModule('audit'), [hasModule]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const currentDate = useMemo(() => {
    return format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  }, []);

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {greeting}, {user?.firstName}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Sistema Integrado de Archivos Digitales - DISA CHINCHEROS
            </p>
          </div>
        </div>
        <EmptyState error={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-tour="dashboard">
      {/* Encabezado Contextual */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.firstName}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-300">
            <Calendar className="h-4 w-4" />
            <p className="text-sm capitalize">{currentDate}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select value={range} onValueChange={(value) => setRange(value as '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Seleccionar rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{rangeLabels['7d']}</SelectItem>
              <SelectItem value="30d">{rangeLabels['30d']}</SelectItem>
              <SelectItem value="90d">{rangeLabels['90d']}</SelectItem>
            </SelectContent>
          </Select>

          {canViewOffices && offices && offices.length > 0 && (
            <Select value={officeId || 'all'} onValueChange={(value) => setOfficeId(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas las oficinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las oficinas</SelectItem>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <>
            {canViewDocuments && <SkeletonCard variant="metric" />}
            {canViewArchivadores && <SkeletonCard variant="metric" />}
            {canViewExpedientes && <SkeletonCard variant="metric" />}
            {canViewSignatures && (
              <>
                <SkeletonCard variant="metric" />
                <SkeletonCard variant="metric" />
                <SkeletonCard variant="metric" />
              </>
            )}
          </>
        ) : data ? (
          <>
            {canViewDocuments && (
              <KpiCard
                title="Documentos"
                value={data.cards.totalDocuments}
                icon={FileText}
                color="blue"
                description="Total registrados"
              />
            )}
            {canViewArchivadores && (
              <KpiCard
                title="Archivadores"
                value={data.cards.totalArchivadores}
                icon={Archive}
                color="purple"
                description="Unidades activas"
              />
            )}
            {canViewExpedientes && (
              <KpiCard
                title="Expedientes"
                value={data.cards.totalExpedientes}
                icon={FolderOpen}
                color="violet"
                description="Total organizados"
              />
            )}
            {canViewSignatures && (
              <>
                <KpiCard
                  title="Firmados"
                  value={data.cards.signaturesCompleted}
                  icon={FileCheck}
                  color="green"
                  description="Completamente firmados"
                />
                <KpiCard
                  title="Parciales"
                  value={data.cards.signaturesPartial}
                  icon={FileWarning}
                  color="amber"
                  description="Firmas parciales"
                />
                <KpiCard
                  title="Pendientes"
                  value={data.cards.signaturesPending}
                  icon={FileClock}
                  color="red"
                  description="Sin firmar"
                />
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Zona Analítica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            {canViewAnalytics && (
              <>
                <SkeletonCard variant="chart" />
                <SkeletonCard variant="chart" />
              </>
            )}
            {canViewAudit && <SkeletonCard variant="list" />}
          </>
        ) : data ? (
          <>
            {canViewAnalytics && canViewDocuments && (
              <TrendChart
                title="Tendencia de Documentos"
                data={data.trends.documentsCreated}
                color="#1d4ed8"
              />
            )}
            {canViewAnalytics && canViewSignatures && (
              <SignatureDonut
                completed={data.cards.signaturesCompleted}
                partial={data.cards.signaturesPartial}
                pending={data.cards.signaturesPending}
              />
            )}
            {canViewAnalytics && <AlertsPanel alerts={data.alerts} />}
            {canViewAudit && <RecentActivityList activities={data.recentActivity} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
