'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Calendar,
  Building2,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SignatureDonut } from '@/components/dashboard/SignatureDonut';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasPermission, hasModule } = usePermissions();
  const { offices } = useOffices();
  const { data, isLoading, error, range, officeId, setRange, setOfficeId, refresh } = useDashboardMetrics();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = async () => {
    await refresh();
    setLastUpdated(new Date());
  };

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
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {greeting}, {user?.firstName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Sistema Integrado de Archivos Digitales
            </p>
          </div>
        </div>
        <EmptyState error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="space-y-5" data-tour="dashboard">
      {/* Alerta de conexión */}
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Sin conexión a internet</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Los datos mostrados podrían no estar actualizados.
          </p>
        </div>
      )}

      {/* Encabezado Contextual */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.firstName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs capitalize">{currentDate}</span>
            </div>
            {user?.office?.name && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs">{user.office.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filtros agrupados */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
              Periodo:
            </span>
            <Select value={range} onValueChange={(value) => setRange(value as '7d' | '30d' | '90d')}>
              <SelectTrigger className="w-full sm:w-[140px] h-8 text-sm bg-white dark:bg-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canViewOffices && offices && offices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
                Oficina:
              </span>
              <Select value={officeId || 'all'} onValueChange={(value) => setOfficeId(value === 'all' ? undefined : value)}>
                <SelectTrigger className="w-full sm:w-[150px] h-8 text-sm bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Todas" />
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
            </div>
          )}

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-8 px-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Actualizar datos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {lastUpdated && (
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden lg:inline">
                Actualizado {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
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
                tooltip="Cantidad total de documentos digitalizados en el sistema"
                onClick={() => router.push('/dashboard/archivo/documentos')}
              />
            )}
            {canViewArchivadores && (
              <KpiCard
                title="Archivadores"
                value={data.cards.totalArchivadores}
                icon={Archive}
                color="purple"
                description="Unidades activas"
                tooltip="Archivadores físicos registrados para organizar documentos"
                onClick={() => router.push('/dashboard/archivo/archivadores')}
              />
            )}
            {canViewExpedientes && (
              <KpiCard
                title="Expedientes"
                value={data.cards.totalExpedientes}
                icon={FolderOpen}
                color="violet"
                description="Total organizados"
                tooltip="Expedientes creados para agrupar documentos relacionados"
                onClick={() => router.push('/dashboard/archivo/expedientes')}
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
                  tooltip="Documentos con todas las firmas requeridas completadas"
                  onClick={() => router.push('/dashboard/firma/flujos?status=completed')}
                />
                <KpiCard
                  title="Parciales"
                  value={data.cards.signaturesPartial}
                  icon={FileWarning}
                  color="amber"
                  description="Firmas parciales"
                  tooltip="Documentos con algunas firmas pendientes"
                  onClick={() => router.push('/dashboard/firma/flujos?status=partial')}
                />
                <KpiCard
                  title="Pendientes"
                  value={data.cards.signaturesPending}
                  icon={FileClock}
                  color="red"
                  description="Sin firmar"
                  tooltip="Documentos que aún no han sido firmados"
                  onClick={() => router.push('/dashboard/firma/firmar')}
                />
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Zona Analítica */}
      <div className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  color="#3b82f6"
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
    </div>
  );
}
