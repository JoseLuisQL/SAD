'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DocumentsTable from '@/components/documents/DocumentsTable';
import DocumentsOverview from '@/components/archivo/documentos/DocumentsOverview';
import { FiltersToolbar } from '@/components/shared/FiltersToolbar';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentAnalytics } from '@/hooks/useDocumentAnalytics';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { Document, DocumentsFilters } from '@/types/document.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DocumentsPage() {
  const router = useRouter();
  const { documents, loading, pagination, fetchDocuments, downloadDocument, deleteDocument } =
    useDocuments();
  const { ingestStats, loadingIngestStats, fetchIngestStats } = useDocumentAnalytics();
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();

  const [filters, setFilters] = useState<DocumentsFilters>({
    page: 1,
    limit: 10,
    search: '',
    archivadorId: '',
    documentTypeId: '',
    officeId: '',
    startDate: '',
    endDate: '',
    signatureStatus: '',
  });
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments(filters);
  }, [filters.page, filters.limit]);

  useEffect(() => {
    fetchIngestStats();
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchIngestStats, fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchDocuments({ ...filters, page: 1 });
  };

  const handleFilterChange = (key: keyof DocumentsFilters, value: string) => {
    const newFilters = { ...filters, page: 1, [key]: value };
    setFilters(newFilters);
    fetchDocuments(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: DocumentsFilters = {
      page: 1,
      limit: 10,
      search: '',
      archivadorId: '',
      documentTypeId: '',
      officeId: '',
      startDate: '',
      endDate: '',
      signatureStatus: '',
    };
    setFilters(resetFilters);
    fetchDocuments(resetFilters);
  };

  const handleRemoveFilter = (key: string) => {
    handleFilterChange(key as keyof DocumentsFilters, '');
  };

  const getActiveFilters = (): Array<{
    key: string;
    value: string;
    label: string;
    displayValue: string;
  }> => {
    const active = [];
    if (filters.archivadorId) {
      const archivador = archivadores.find((a) => a.id === filters.archivadorId);
      active.push({
        key: 'archivadorId',
        value: filters.archivadorId,
        label: 'Archivador',
        displayValue: archivador?.code || filters.archivadorId,
      });
    }
    if (filters.documentTypeId) {
      const type = documentTypes.find((t) => t.id === filters.documentTypeId);
      active.push({
        key: 'documentTypeId',
        value: filters.documentTypeId,
        label: 'Tipo',
        displayValue: type?.name || filters.documentTypeId,
      });
    }
    if (filters.officeId) {
      const office = offices.find((o) => o.id === filters.officeId);
      active.push({
        key: 'officeId',
        value: filters.officeId,
        label: 'Oficina',
        displayValue: office?.name || filters.officeId,
      });
    }
    if (filters.signatureStatus) {
      const statusLabels: Record<string, string> = {
        UNSIGNED: 'Sin Firmar',
        SIGNED: 'Firmados',
        PARTIALLY_SIGNED: 'Parcialmente Firmados',
        IN_FLOW: 'En Proceso',
        REVERTED: 'Revertidos',
      };
      active.push({
        key: 'signatureStatus',
        value: filters.signatureStatus,
        label: 'Firma',
        displayValue: statusLabels[filters.signatureStatus] || filters.signatureStatus,
      });
    }
    if (filters.startDate) {
      active.push({
        key: 'startDate',
        value: filters.startDate,
        label: 'Desde',
        displayValue: filters.startDate,
      });
    }
    if (filters.endDate) {
      active.push({
        key: 'endDate',
        value: filters.endDate,
        label: 'Hasta',
        displayValue: filters.endDate,
      });
    }
    return active;
  };

  const handleView = (document: Document) => {
    router.push(`/dashboard/archivo/documentos/${document.id}`);
  };

  const handleDownload = (document: Document) => {
    downloadDocument(document.id, document.fileName);
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await deleteDocument(documentToDelete.id);
      setDocumentToDelete(null);
      fetchDocuments(filters);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentos</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Gestiona los documentos del sistema</p>
        </div>
        <div className="flex space-x-2" data-tour="documentos-upload-button">
          <Button onClick={() => router.push('/dashboard/archivo/documentos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Documento
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/archivo/documentos/carga-masiva')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Carga Masiva
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div data-tour="documentos-stats">
        <DocumentsOverview stats={ingestStats} loading={loadingIngestStats} />
      </div>

      {/* Filters Toolbar */}
      <div data-tour="documentos-search">
        <FiltersToolbar
          searchPlaceholder="Buscar por número, remitente..."
          searchValue={filters.search || ''}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          activeFilters={getActiveFilters()}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleResetFilters}
        renderFilterContent={() => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Archivador
            </label>
            <select
              value={filters.archivadorId}
              onChange={(e) => handleFilterChange('archivadorId', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {archivadores.map((archivador) => (
                <option key={archivador.id} value={archivador.id}>
                  {archivador.code} - {archivador.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Tipo de Documento
            </label>
            <select
              value={filters.documentTypeId}
              onChange={(e) => handleFilterChange('documentTypeId', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Oficina</label>
            <select
              value={filters.officeId}
              onChange={(e) => handleFilterChange('officeId', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Estado de Firma
            </label>
            <select
              value={filters.signatureStatus}
              onChange={(e) => handleFilterChange('signatureStatus', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="UNSIGNED">Sin Firmar</option>
              <option value="SIGNED">Firmados</option>
              <option value="PARTIALLY_SIGNED">Parcialmente Firmados</option>
              <option value="IN_FLOW">En Proceso</option>
              <option value="REVERTED">Revertidos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        )}
        />
      </div>

      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" data-tour="documentos-table">
        <DocumentsTable
          documents={documents}
          loading={loading}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={(doc) => setDocumentToDelete(doc)}
        />

        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} documentos
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Esta acción no se puede deshacer. El documento{' '}
              <strong className="dark:text-slate-200">{documentToDelete?.documentNumber}</strong> será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
