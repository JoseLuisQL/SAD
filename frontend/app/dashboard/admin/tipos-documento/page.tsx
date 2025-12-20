'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useTypologyStats } from '@/hooks/useTypologyStats';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { DocumentType, CreateDocumentTypeData, UpdateDocumentTypeData, DocumentTypesFilters } from '@/types/typologies.types';
import { 
  FileText, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { TypologyStats } from '@/components/typologies/TypologyStats';
import { ImportExportPanel } from '@/components/typologies/ImportExportPanel';
import { TypologyTable } from '@/components/typologies/TypologyTable';
import { TypologyDetailModal } from '@/components/typologies/TypologyDetailModal';
import { BulkActionDialog } from '@/components/typologies/BulkActionDialog';

export default function TiposDocumentoPage() {
  const { documentTypes, loading, pagination, fetchDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } = useDocumentTypes();
  const { stats, loading: statsLoading, refresh: refreshStats } = useTypologyStats('documentType');
  const { 
    selected, 
    isProcessing, 
    toggleSelect, 
    toggleSelectAll, 
    bulkDelete, 
    bulkActivate, 
    bulkDeactivate 
  } = useBulkOperations('documentType');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate'>('delete');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailDocumentTypeId, setDetailDocumentTypeId] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentTypeToDelete, setDocumentTypeToDelete] = useState<DocumentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentFilters, setCurrentFilters] = useState<DocumentTypesFilters>({ page: 1, limit: 10 });

  // Form state with validation
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentFilters(prev => ({
      ...prev,
      page: 1,
      search: value || undefined,
    }));
  }, 400);

  useEffect(() => {
    fetchDocumentTypes(currentFilters);
  }, [fetchDocumentTypes, currentFilters]);

  // Form validation
  const validateForm = useCallback((data: typeof formData) => {
    const newErrors: { name?: string } = {};
    
    if (!data.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (data.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (data.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedDocumentType(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (documentType: DocumentType) => {
    setModalMode('edit');
    setSelectedDocumentType(documentType);
    setFormData({
      name: documentType.name,
      description: documentType.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDocumentType(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
  };

  const openDetailModal = (documentTypeId: string) => {
    setDetailDocumentTypeId(documentTypeId);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailDocumentTypeId(null);
  };

  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    setBulkOperation(action);
    setBulkDialogOpen(true);
  };

  const handleBulkConfirm = async () => {
    try {
      switch (bulkOperation) {
        case 'delete':
          await bulkDelete();
          break;
        case 'activate':
          await bulkActivate();
          break;
        case 'deactivate':
          await bulkDeactivate();
          break;
      }
      setBulkDialogOpen(false);
      fetchDocumentTypes(currentFilters);
      refreshStats();
    } catch (error) {
      console.error('Error en operación masiva:', error);
    }
  };

  const handleSave = async () => {
    if (!validateForm(formData) || isSaving) return;

    try {
      setIsSaving(true);
      if (modalMode === 'create') {
        await createDocumentType(formData as CreateDocumentTypeData);
      } else if (selectedDocumentType) {
        await updateDocumentType(selectedDocumentType.id, formData as UpdateDocumentTypeData);
      }
      closeModal();
      fetchDocumentTypes(currentFilters);
      refreshStats();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (documentType: DocumentType) => {
    setDocumentTypeToDelete(documentType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentTypeToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDocumentType(documentTypeToDelete.id);
      fetchDocumentTypes(currentFilters);
      refreshStats();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentTypeToDelete(null);
    }
  };

  const handleImportComplete = () => {
    fetchDocumentTypes(currentFilters);
    refreshStats();
  };

  // Filter handlers
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentFilters(prev => ({
      ...prev,
      page: 1,
      isActive: value === 'all' ? undefined : value === 'active',
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters(prev => ({ ...prev, page }));
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <main id="main-content" className="space-y-6" role="main" aria-label="Gestión de Tipos de Documento">
      {/* Skip link for accessibility */}
      <a
        href="#document-types-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
      >
        Saltar a la tabla de tipos de documento
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
        <span className="text-gray-900 dark:text-white font-medium" aria-current="page">Tipos de Documento</span>
      </nav>

      {/* Header mejorado */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30" aria-hidden="true">
            <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Tipos de Documento
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Administre las categorías de documentos del sistema
            </p>
          </div>
        </div>
        <Button 
          onClick={openCreateModal} 
          size="lg" 
          className="shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          data-tour="tipos-documento-create-button"
        >
          <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
          Nuevo Tipo
        </Button>
      </header>

      {/* Estadísticas */}
      <section aria-label="Estadísticas de tipos de documento" data-tour="tipos-documento-stats">
        <TypologyStats 
          type="documentType" 
          stats={stats} 
          loading={statsLoading}
          onRefresh={refreshStats}
        />
      </section>

      {/* Import/Export Panel */}
      <ImportExportPanel
        type="documentType"
        currentFilters={currentFilters}
        onImportComplete={handleImportComplete}
      />

      {/* Filtros y búsqueda mejorados */}
      <section 
        aria-label="Filtros de búsqueda"
        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-4" 
        data-tour="tipos-documento-search"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda con icono */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Buscar por nombre o código... (Ej: TD-001, Resolución, Oficio)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Buscar tipos de documento"
            />
          </div>
          
          {/* Filtros de estado como Pills */}
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Filtrar por estado">
            <span className="text-sm text-gray-500 dark:text-slate-400 mr-2">Estado:</span>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusFilterChange(option.value)}
                  role="radio"
                  aria-checked={statusFilter === option.value}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    statusFilter === option.value
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-4 w-4 mr-1" aria-hidden="true" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </section>

      {/* Tabla con selección múltiple */}
      <section id="document-types-table" aria-label="Lista de tipos de documento" data-tour="tipos-documento-table">
        <div role="status" aria-live="polite" aria-busy={loading}>
          {loading && <p className="sr-only">Cargando lista de tipos de documento...</p>}
        </div>
        <TypologyTable
          type="documentType"
          data={documentTypes}
          loading={loading}
          selected={selected}
          onSelect={toggleSelect}
          onSelectAll={(ids) => toggleSelectAll(ids)}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
          onView={openDetailModal}
          onBulkAction={handleBulkAction}
          onCreateNew={openCreateModal}
        />
      </section>

      {/* Paginación mejorada */}
      {pagination.totalPages > 1 && (
        <nav 
          aria-label="Paginación"
          className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm"
        >
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando{' '}
            <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
            {' '}a{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
            {' '}de{' '}
            <span className="font-medium">{pagination.total}</span> tipos
          </p>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-slate-300" aria-current="page">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="h-8 w-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}

      {/* Modal de Crear/Editar con validación mejorada */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                {modalMode === 'create' ? 'Crear Nuevo Tipo de Documento' : 'Editar Tipo de Documento'}
              </div>
            </DialogTitle>
          </DialogHeader>

          {modalMode === 'edit' && selectedDocumentType && (
            <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                <span className="font-semibold">Código:</span> {selectedDocumentType.code}
                <span className="text-xs ml-2 text-indigo-600 dark:text-indigo-400">(generado automáticamente)</span>
              </p>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div>
              <Label htmlFor="doc-type-name" className="dark:text-slate-300">
                Nombre del Tipo <span className="text-red-500" aria-hidden="true">*</span>
              </Label>
              <Input
                id="doc-type-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) validateForm({ ...formData, name: e.target.value });
                }}
                onBlur={() => validateForm(formData)}
                placeholder="Ej: Resolución, Oficio, Memorando"
                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                aria-required="true"
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'name-error' : 'name-hint'}
                autoFocus
              />
              {formErrors.name ? (
                <p id="name-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {formErrors.name}
                </p>
              ) : (
                <p id="name-hint" className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">
                  {formData.name.length}/100 caracteres
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="doc-type-description" className="dark:text-slate-300">
                Descripción <span className="text-gray-400 text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="doc-type-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el uso de este tipo de documento..."
                rows={3}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={closeModal} 
                disabled={isSaving}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!formData.name.trim() || isSaving}
                className="min-w-[120px]"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {modalMode === 'create' ? 'Crear Tipo' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          
          {documentTypeToDelete && (
            <div className="py-4">
              <p className="text-gray-600 dark:text-slate-300 mb-4">
                ¿Está seguro de eliminar el siguiente tipo de documento?
              </p>
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="font-mono text-sm text-gray-500 dark:text-slate-400">
                  {documentTypeToDelete.code}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {documentTypeToDelete.name}
                </p>
                {(documentTypeToDelete._count?.documents ?? 0) > 0 && (
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    Este tipo tiene {documentTypeToDelete._count?.documents} documentos asociados
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                Esta acción no se puede deshacer.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="min-w-[140px]"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Eliminar Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle */}
      <TypologyDetailModal
        type="documentType"
        id={detailDocumentTypeId}
        open={detailModalOpen}
        onClose={closeDetailModal}
        onEdit={(documentType) => {
          closeDetailModal();
          openEditModal(documentType);
        }}
      />

      {/* Dialog de Operaciones Masivas */}
      <BulkActionDialog
        open={bulkDialogOpen}
        operation={bulkOperation}
        items={documentTypes.filter(dt => selected.includes(dt.id)).map(dt => ({
          id: dt.id,
          code: dt.code,
          name: dt.name
        }))}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkDialogOpen(false)}
        loading={isProcessing}
      />
    </main>
  );
}
