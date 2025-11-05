'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, FileText, Sparkles, ChevronDown } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReports } from '@/hooks/useReports';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportEmptyState from '@/components/reports/ReportEmptyState';
import ReportSkeleton from '@/components/reports/ReportSkeleton';
import ReportTable, { Column } from '@/components/reports/ReportTable';
import ExportMenu from '@/components/reports/ExportMenu';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ReportSection, ReportSectionHeader, ReportGrid } from '@/components/reports/ReportLayout';
import {
  DocumentReportSummary,
  UserActivityReportSummary,
  SignatureReportSummary,
} from '@/components/reports/ReportSummary';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load charts for better performance
const ReportBarChart = dynamic(
  () => import('@/components/reports/ReportCharts').then((mod) => mod.ReportBarChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />
  }
);

const ReportLineChart = dynamic(
  () => import('@/components/reports/ReportCharts').then((mod) => mod.ReportLineChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />
  }
);

const ReportPieChart = dynamic(
  () => import('@/components/reports/ReportCharts').then((mod) => mod.ReportPieChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />
  }
);
import { ReportType, ReportFilters as Filters, ExportFormat } from '@/types/report.types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function ReportesPage() {
  const {
    loading,
    exporting,
    documentReport,
    activityReport,
    signatureReport,
    fetchDocumentReport,
    fetchUserActivityReport,
    fetchSignatureReport,
    exportReport,
  } = useReports();

  const [currentReportType, setCurrentReportType] = useState<ReportType | null>(null);
  const { startTour, resetTour } = useOnboarding();

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sistema Integrado de Archivos Digitales - Reportes',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PEN',
    },
    featureList: [
      'Reportes de documentos digitalizados',
      'Analítica de actividad de usuarios',
      'Reportes de firmas digitales',
      'Exportación a PDF, Excel y CSV',
      'Gráficos interactivos y estadísticas',
    ],
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Dashboard',
        item: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reportes y Analítica',
        item: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/reportes`,
      },
    ],
  };

  const handleGenerateReport = async (type: ReportType, filters: Filters) => {
    setCurrentReportType(type);

    switch (type) {
      case 'documents':
        await fetchDocumentReport(filters);
        break;
      case 'activity':
        await fetchUserActivityReport(filters);
        break;
      case 'signatures':
        await fetchSignatureReport(filters);
        break;
    }
  };

  const handleExportReport = async (type: ReportType, filters: Filters, format: ExportFormat) => {
    await exportReport(type, filters, format);
  };

  const handleStartTour = (tourId: string) => {
    resetTour(tourId);
    setTimeout(() => {
      startTour(tourId);
    }, 100);
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb - Navegación semántica */}
        <Breadcrumb
          items={[
            { label: 'Reportes y Analítica', current: true }
          ]}
        />

        {/* Header */}
        <div className="mb-8" data-tour="reportes-header">
          <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <BarChart3 className="h-8 w-8" />
            </div>
            Reportes y Analítica
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                data-tour="reportes-guided-tour"
              >
                <Sparkles className="h-4 w-4" />
                Recorrido guiado
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleStartTour('reportes-intro-tour')}>
                <FileText className="h-4 w-4 mr-2" />
                Introducción a Reportes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStartTour('reportes-documentos-tour')}>
                <FileText className="h-4 w-4 mr-2" />
                Reporte de Documentos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStartTour('reportes-actividad-tour')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Reporte de Actividad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStartTour('reportes-firmas-tour')}>
                <FileText className="h-4 w-4 mr-2" />
                Reporte de Firmas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-base">
            Genere reportes detallados sobre documentos, actividad de usuarios y firmas digitales. Exportación a PDF, Excel y CSV.
          </p>
        </div>

        {/* Filtros */}
        <ReportSection data-tour="reportes-filters">
          <ReportFilters
            onGenerate={handleGenerateReport}
            onExport={handleExportReport}
            loading={loading}
            exporting={exporting}
          />
        </ReportSection>

        {/* Área de Reportes */}
        {loading && <ReportSkeleton />}

        {!loading && !documentReport && !activityReport && !signatureReport && !currentReportType && (
          <ReportEmptyState
            message="Seleccione un tipo de reporte"
            description="Configure los filtros y haga clic en 'Generar Reporte' para ver las analíticas y estadísticas del sistema."
          />
        )}

        {!loading && currentReportType && !documentReport && !activityReport && !signatureReport && (
          <ReportEmptyState
            message="No se encontraron datos"
            description="No hay información disponible con los filtros seleccionados. Intenta ajustar los criterios de búsqueda o el rango de fechas."
            onAdjustFilters={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        )}

        {/* Reporte de Documentos */}
        {currentReportType === 'documents' && documentReport && (
          <div className="space-y-6">
            <div data-tour="reportes-doc-summary">
              <DocumentReportSummary summary={documentReport.summary} />
            </div>

            <ReportGrid columns={2} data-tour="reportes-doc-charts">
            <ReportBarChart
              data={documentReport.documentsByType}
              title="Documentos por Tipo"
              dataKey="count"
              nameKey="documentTypeName"
              color="#3b82f6"
            />

            <ReportPieChart
              data={documentReport.documentsByOffice}
              title="Distribución por Oficina"
              dataKey="count"
              nameKey="officeName"
            />
          </ReportGrid>

          <ReportSection data-tour="reportes-doc-trend">
            <ReportLineChart
              data={documentReport.documentsByMonth}
              title="Tendencia Mensual de Documentos"
              dataKey="count"
              nameKey="month"
              color="#0f766e"
              height={350}
            />
          </ReportSection>

          {/* Tabla de Documentos por Tipo con ReportTable */}
          <ReportSection data-tour="reportes-doc-table">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Detalle de Documentos por Tipo
              </h3>
              <ExportMenu
                onExport={(format) => handleExportReport('documents', {} as Filters, format)}
                exporting={exporting}
                formats={['pdf', 'xlsx', 'csv']}
                label=""
                size="sm"
              />
            </div>
            <ReportTable
              data={documentReport.documentsByType}
              columns={[
                {
                  key: 'documentTypeName',
                  header: 'Tipo de Documento',
                  sortable: true,
                },
                {
                  key: 'count',
                  header: 'Cantidad',
                  sortable: true,
                  accessor: (row) => (
                    <>
                      {row.count}
                      <span className="sr-only"> documentos</span>
                    </>
                  ),
                },
                {
                  key: 'totalFolios',
                  header: 'Total Folios',
                  sortable: true,
                  accessor: (row) => (
                    <>
                      {row.totalFolios}
                      <span className="sr-only"> folios</span>
                    </>
                  ),
                },
              ]}
              caption="Tabla de documentos clasificados por tipo con cantidades y folios totales"
            />
          </ReportSection>
        </div>
      )}

        {/* Reporte de Actividad */}
        {currentReportType === 'activity' && activityReport && (
          <div className="space-y-6">
            <div data-tour="reportes-act-summary">
              <UserActivityReportSummary summary={activityReport.summary} />
            </div>

            <ReportGrid columns={2}>
            <div data-tour="reportes-act-module">
              <ReportBarChart
                data={activityReport.activityByModule}
                title="Actividad por Módulo"
                dataKey="count"
                nameKey="module"
                color="#8b5cf6"
              />
            </div>

            <div>
              <ReportBarChart
                data={activityReport.activityByAction.slice(0, 10)}
                title="Top 10 Acciones"
                dataKey="count"
                nameKey="action"
                color="#f59e0b"
              />
            </div>
          </ReportGrid>

          <ReportSection data-tour="reportes-act-trend">
            <ReportLineChart
              data={activityReport.activityByDay}
              title="Actividad Diaria"
              dataKey="count"
              nameKey="day"
              color="#0f766e"
              height={350}
            />
          </ReportSection>

          {/* Tabla de Usuarios Más Activos con ReportTable */}
          <ReportSection data-tour="reportes-act-users">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Top 10 Usuarios Más Activos
              </h3>
              <ExportMenu
                onExport={(format) => handleExportReport('activity', {} as Filters, format)}
                exporting={exporting}
                formats={['pdf', 'xlsx', 'csv']}
                label=""
                size="sm"
              />
            </div>
            <ReportTable
              data={activityReport.activityByUser.slice(0, 10)}
              columns={[
                {
                  key: 'username',
                  header: 'Usuario',
                  sortable: true,
                },
                {
                  key: 'fullName',
                  header: 'Nombre Completo',
                  sortable: true,
                },
                {
                  key: 'totalActions',
                  header: 'Total Acciones',
                  sortable: true,
                  accessor: (row) => (
                    <>
                      {row.totalActions}
                      <span className="sr-only"> acciones realizadas</span>
                    </>
                  ),
                },
              ]}
              caption="Ranking de los 10 usuarios con mayor actividad en el sistema"
            />
          </ReportSection>
        </div>
      )}

        {/* Reporte de Firmas */}
        {currentReportType === 'signatures' && signatureReport && (
          <div className="space-y-6">
            <div data-tour="reportes-sig-summary">
              <SignatureReportSummary summary={signatureReport.summary} />
            </div>

            <ReportGrid columns={2} data-tour="reportes-sig-charts">
            <ReportBarChart
              data={signatureReport.signaturesBySigner.slice(0, 10)}
              title="Top 10 Firmantes"
              dataKey="count"
              nameKey="signerName"
              color="#3b82f6"
            />

            <ReportPieChart
              data={signatureReport.signaturesByStatus}
              title="Firmas por Estado"
              dataKey="count"
              nameKey="status"
            />
          </ReportGrid>

          <ReportSection data-tour="reportes-sig-trend">
            <ReportLineChart
              data={signatureReport.signaturesByDay}
              title="Tendencia de Firmas por Día"
              dataKey="count"
              nameKey="date"
              color="#0f766e"
              height={350}
            />
          </ReportSection>

          {/* Tabla de Firmantes con ReportTable */}
          <ReportSection data-tour="reportes-sig-table">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Top 10 Firmantes
              </h3>
              <ExportMenu
                onExport={(format) => handleExportReport('signatures', {} as Filters, format)}
                exporting={exporting}
                formats={['pdf', 'xlsx', 'csv']}
                label=""
                size="sm"
              />
            </div>
            <ReportTable
              data={signatureReport.signaturesBySigner.slice(0, 10)}
              columns={[
                {
                  key: 'signerName',
                  header: 'Firmante',
                  sortable: true,
                },
                {
                  key: 'username',
                  header: 'Usuario',
                  sortable: true,
                },
                {
                  key: 'count',
                  header: 'Total Firmas',
                  sortable: true,
                  accessor: (row) => (
                    <>
                      {row.count}
                      <span className="sr-only"> firmas digitales realizadas</span>
                    </>
                  ),
                },
              ]}
              caption="Ranking de los 10 usuarios que más han firmado documentos digitalmente"
            />
          </ReportSection>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
