'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DocumentsTable from '@/components/documents/DocumentsTable';
import DocumentsOverview from '@/components/archivo/documentos/DocumentsOverview';
import { FiltersToolbar } from '@/components/shared/FiltersToolbar';
import { Pagination } from '@/components/shared/Pagination';
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
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDocuments(filters);
  }, [filters.page, filters.limit]);

  useEffect(() => {
    fetchIngestStats();
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchIngestStats, fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  // Busqueda instantanea con debounce
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
      fetchDocuments({ ...filters, search: value, page: 1 });
    }, 300);
    
    setSearchDebounce(timeout);
  }, [filters, fetchDocuments, searchDebounce]);

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
      limit: filters.limit,
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
    if (documentToDelete && deleteConfirmText === 'ELIMINAR') {
      await deleteDocument(documentToDelete.id);
      setDocumentToDelete(null);
      setDeleteConfirmText('');
      fetchDocuments(filters);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setFilters({ ...filters, limit: newLimit, page: 1 });
    fetchDocuments({ ...filters, limit: newLimit, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Documentos
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Gestiona los documentos digitalizados del sistema
          </p>
        </div>
        <div className="flex gap-2" data-tour="documentos-upload-button">
          <Button 
            onClick={() => router.push('/dashboard/archivo/documentos/nuevo')}
            aria-label="Crear nuevo documento"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/archivo/documentos/carga-masiva')}
            aria-label="Carga masiva de documentos"
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Carga Masiva
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard - Simplificado */}
      <div data-tour="documentos-stats">
        <DocumentsOverview stats={ingestStats} loading={loadingIngestStats} />
      </div>

      {/* Filters Toolbar */}
      <div data-tour="documentos-search">
        <FiltersToolbar
          searchPlaceholder="Buscar por numero, remitente..."
          searchValue={filters.search || ''}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          activeFilters={getActiveFilters()}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleResetFilters}
          renderFilterContent={() => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label 
                  htmlFor="filter-archivador"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Archivador
                </label>
                <select
                  id="filter-archivador"
                  value={filters.archivadorId}
                  onChange={(e) => handleFilterChange('archivadorId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por archivador"
                >
                  <option value="">Todos los archivadores</option>
                  {archivadores.map((archivador) => (
                    <option key={archivador.id} value={archivador.id}>
                      {archivador.code} - {archivador.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="filter-type"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Tipo de Documento
                </label>
                <select
                  id="filter-type"
                  value={filters.documentTypeId}
                  onChange={(e) => handleFilterChange('documentTypeId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por tipo de documento"
                >
                  <option value="">Todos los tipos</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="filter-office"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Oficina
                </label>
                <select
                  id="filter-office"
                  value={filters.officeId}
                  onChange={(e) => handleFilterChange('officeId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por oficina"
                >
                  <option value="">Todas las oficinas</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="filter-signature"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Estado de Firma
                </label>
                <select
                  id="filter-signature"
                  value={filters.signatureStatus}
                  onChange={(e) => handleFilterChange('signatureStatus', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar por estado de firma"
                >
                  <option value="">Todos los estados</option>
                  <option value="UNSIGNED">Sin Firmar</option>
                  <option value="SIGNED">Firmados</option>
                  <option value="PARTIALLY_SIGNED">Parcialmente Firmados</option>
                  <option value="IN_FLOW">En Proceso</option>
                  <option value="REVERTED">Revertidos</option>
                </select>
              </div>

              <div>
                <label 
                  htmlFor="filter-start-date"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Fecha Desde
                </label>
                <input
                  id="filter-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar desde fecha"
                />
              </div>

              <div>
                <label 
                  htmlFor="filter-end-date"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Fecha Hasta
                </label>
                <input
                  id="filter-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrar hasta fecha"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Documents Table */}
      <Card 
        className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" 
        data-tour="documentos-table"
      >
        <DocumentsTable
          documents={documents}
          loading={loading}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={(doc) => setDocumentToDelete(doc)}
        />

        {/* Paginacion mejorada */}
        {pagination.pages > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6 border-t border-gray-200 dark:border-slate-700"
          />
        )}
      </Card>

      {/* Delete Confirmation Dialog - Mejorado */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => {
        setDocumentToDelete(null);
        setDeleteConfirmText('');
      }}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="dark:text-white">
                Eliminar documento
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="dark:text-slate-400 space-y-3">
              <p>
                Esta accion eliminara permanentemente el documento{' '}
                <strong className="text-gray-900 dark:text-white">
                  {documentToDelete?.documentNumber}
                </strong>
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">
                  Se eliminara:
                </p>
                <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
                  <li>El archivo PDF ({documentToDelete?.fileName})</li>
                  <li>Todas las versiones del documento</li>
                  <li>Historial de firmas y cambios</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <label 
                  htmlFor="delete-confirm"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
                >
                  Escribe <strong>ELIMINAR</strong> para confirmar:
                </label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="ELIMINAR"
                  className="uppercase"
                  aria-describedby="delete-confirm-help"
                />
                <p id="delete-confirm-help" className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  Esta confirmacion previene eliminaciones accidentales
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmText !== 'ELIMINAR'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Eliminar documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
