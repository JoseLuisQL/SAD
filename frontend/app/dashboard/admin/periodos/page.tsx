'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { usePeriods } from '@/hooks/usePeriods';
import { useTypologyStats } from '@/hooks/useTypologyStats';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { Period, CreatePeriodData, UpdatePeriodData } from '@/types/typologies.types';
import { 
  Calendar, 
  Plus, 
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { TypologyStats } from '@/components/typologies/TypologyStats';
import { ImportExportPanel } from '@/components/typologies/ImportExportPanel';
import { TypologyTable } from '@/components/typologies/TypologyTable';
import { TypologyDetailModal } from '@/components/typologies/TypologyDetailModal';
import { BulkActionDialog } from '@/components/typologies/BulkActionDialog';

export default function PeriodosPage() {
  const { periods, loading, fetchPeriods, createPeriod, updatePeriod, deletePeriod } = usePeriods();
  const { stats, loading: statsLoading, refresh: refreshStats } = useTypologyStats('period');
  const { 
    selected, 
    isProcessing, 
    toggleSelect, 
    toggleSelectAll, 
    bulkDelete, 
    bulkActivate, 
    bulkDeactivate 
  } = useBulkOperations('period');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate'>('delete');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailPeriodId, setDetailPeriodId] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state with validation
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    description: '',
  });
  const [formErrors, setFormErrors] = useState<{ year?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Form validation
  const validateForm = useCallback((data: typeof formData) => {
    const newErrors: { year?: string } = {};
    const currentYear = new Date().getFullYear();
    
    if (!data.year) {
      newErrors.year = 'El año es requerido';
    } else if (data.year < 1900 || data.year > 2100) {
      newErrors.year = 'El año debe estar entre 1900 y 2100';
    } else if (data.year > currentYear + 10) {
      newErrors.year = `El año no puede ser mayor a ${currentYear + 10}`;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPeriod(null);
    setFormData({ year: new Date().getFullYear(), description: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (period: Period) => {
    setModalMode('edit');
    setSelectedPeriod(period);
    setFormData({
      year: period.year,
      description: period.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPeriod(null);
    setFormData({ year: new Date().getFullYear(), description: '' });
    setFormErrors({});
  };

  const openDetailModal = (periodId: string) => {
    setDetailPeriodId(periodId);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailPeriodId(null);
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
      fetchPeriods();
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
        await createPeriod(formData as CreatePeriodData);
      } else if (selectedPeriod) {
        await updatePeriod(selectedPeriod.id, formData as UpdatePeriodData);
      }
      closeModal();
      fetchPeriods();
      refreshStats();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (period: Period) => {
    setPeriodToDelete(period);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!periodToDelete) return;
    try {
      setIsDeleting(true);
      await deletePeriod(periodToDelete.id);
      fetchPeriods();
      refreshStats();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPeriodToDelete(null);
    }
  };

  const handleImportComplete = () => {
    fetchPeriods();
    refreshStats();
  };

  return (
    <main id="main-content" className="space-y-6" role="main" aria-label="Gestión de Periodos">
      {/* Skip link for accessibility */}
      <a
        href="#periods-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
      >
        Saltar a la tabla de periodos
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
        <span className="text-gray-900 dark:text-white font-medium" aria-current="page">Periodos</span>
      </nav>

      {/* Header mejorado */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30" aria-hidden="true">
            <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Periodos
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Administre los periodos fiscales del sistema
            </p>
          </div>
        </div>
        <Button 
          onClick={openCreateModal} 
          size="lg" 
          className="shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          data-tour="periodos-create-button"
        >
          <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
          Nuevo Periodo
        </Button>
      </header>

      {/* Estadísticas */}
      <section aria-label="Estadísticas de periodos" data-tour="periodos-stats">
        <TypologyStats 
          type="period" 
          stats={stats} 
          loading={statsLoading}
          onRefresh={refreshStats}
        />
      </section>

      {/* Import/Export Panel */}
      <ImportExportPanel
        type="period"
        onImportComplete={handleImportComplete}
      />

      {/* Tabla con selección múltiple */}
      <section id="periods-table" aria-label="Lista de periodos" data-tour="periodos-table">
        <div role="status" aria-live="polite" aria-busy={loading}>
          {loading && <p className="sr-only">Cargando lista de periodos...</p>}
        </div>
        <TypologyTable
          type="period"
          data={periods}
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

      {/* Modal de Crear/Editar con validación mejorada */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" aria-hidden="true" />
                {modalMode === 'create' ? 'Crear Nuevo Periodo' : 'Editar Periodo'}
              </div>
            </DialogTitle>
          </DialogHeader>

          {modalMode === 'edit' && selectedPeriod && (
            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <span className="font-semibold">Año:</span> {selectedPeriod.year}
                <span className="text-xs ml-2 text-purple-600 dark:text-purple-400">(no modificable)</span>
              </p>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div>
              <Label htmlFor="period-year" className="dark:text-slate-300">
                Año <span className="text-red-500" aria-hidden="true">*</span>
              </Label>
              <Input
                id="period-year"
                type="number"
                value={formData.year}
                onChange={(e) => {
                  const year = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, year });
                  if (formErrors.year) validateForm({ ...formData, year });
                }}
                onBlur={() => validateForm(formData)}
                placeholder="Ej: 2024"
                min={1900}
                max={2100}
                disabled={modalMode === 'edit'}
                className={`dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  formErrors.year ? 'border-red-500 focus-visible:ring-red-500' : ''
                } ${modalMode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-required="true"
                aria-invalid={!!formErrors.year}
                aria-describedby={formErrors.year ? 'year-error' : 'year-hint'}
                autoFocus={modalMode === 'create'}
              />
              {formErrors.year ? (
                <p id="year-error" className="mt-1.5 text-sm text-red-500 flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {formErrors.year}
                </p>
              ) : modalMode === 'edit' ? (
                <p id="year-hint" className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">
                  El año no puede modificarse una vez creado
                </p>
              ) : (
                <p id="year-hint" className="mt-1.5 text-xs text-gray-500 dark:text-slate-500">
                  Ingrese un año entre 1900 y 2100
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="period-description" className="dark:text-slate-300">
                Descripción <span className="text-gray-400 text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="period-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Periodo fiscal principal, Periodo de transición..."
                rows={3}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                autoFocus={modalMode === 'edit'}
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
                disabled={!formData.year || !!formErrors.year || isSaving}
                className="min-w-[120px]"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {modalMode === 'create' ? 'Crear Periodo' : 'Guardar Cambios'}
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
          
          {periodToDelete && (
            <div className="py-4">
              <p className="text-gray-600 dark:text-slate-300 mb-4">
                ¿Está seguro de eliminar el siguiente periodo?
              </p>
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="font-mono text-2xl font-bold text-gray-900 dark:text-white">
                  {periodToDelete.year}
                </p>
                {periodToDelete.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {periodToDelete.description}
                  </p>
                )}
                {(periodToDelete._count?.archivadores ?? 0) > 0 && (
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    Este periodo tiene {periodToDelete._count?.archivadores} archivadores asociados
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
              Eliminar Periodo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle */}
      <TypologyDetailModal
        type="period"
        id={detailPeriodId}
        open={detailModalOpen}
        onClose={closeDetailModal}
        onEdit={(period) => {
          closeDetailModal();
          openEditModal(period);
        }}
      />

      {/* Dialog de Operaciones Masivas */}
      <BulkActionDialog
        open={bulkDialogOpen}
        operation={bulkOperation}
        items={periods.filter(p => selected.includes(p.id)).map(p => ({
          id: p.id,
          code: String(p.year),
          name: `Periodo ${p.year}${p.description ? ' - ' + p.description : ''}`
        }))}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkDialogOpen(false)}
        loading={isProcessing}
      />
    </main>
  );
}
