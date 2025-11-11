'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { usePeriods } from '@/hooks/usePeriods';
import { useTypologyStats } from '@/hooks/useTypologyStats';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { Period, CreatePeriodData, UpdatePeriodData } from '@/types/typologies.types';
import { Calendar, Plus } from 'lucide-react';
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
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate'>('delete');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailPeriodId, setDetailPeriodId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    description: '',
  });

  const [errors, setErrors] = useState({
    year: '',
  });

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPeriod(null);
    setFormData({ year: new Date().getFullYear(), description: '' });
    setErrors({ year: '' });
    setModalOpen(true);
  };

  const openEditModal = (period: Period) => {
    setModalMode('edit');
    setSelectedPeriod(period);
    setFormData({
      year: period.year,
      description: period.description || '',
    });
    setErrors({ year: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPeriod(null);
    setFormData({ year: new Date().getFullYear(), description: '' });
    setErrors({ year: '' });
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

  const validateForm = () => {
    const newErrors = { year: '' };
    let isValid = true;

    const currentYear = new Date().getFullYear();
    
    if (!formData.year) {
      newErrors.year = 'El año es requerido';
      isValid = false;
    } else if (formData.year < 1900 || formData.year > 2100) {
      newErrors.year = 'El año debe estar entre 1900 y 2100';
      isValid = false;
    } else if (formData.year > currentYear + 10) {
      newErrors.year = `El año no puede ser mayor a ${currentYear + 10}`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
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
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este periodo?')) {
      try {
        await deletePeriod(id);
        fetchPeriods();
        refreshStats();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleImportComplete = () => {
    fetchPeriods();
    refreshStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Periodos</h1>
          <p className="text-gray-600 mt-1">
            Administre los periodos fiscales del sistema
          </p>
        </div>
        <Button onClick={openCreateModal} data-tour="periodos-create-button">
          <Plus className="mr-2 h-4 w-4" />
          Crear Periodo
        </Button>
      </div>

      {/* Estadísticas */}
      <div data-tour="periodos-stats">
        <TypologyStats 
          type="period" 
          stats={stats} 
          loading={statsLoading}
          onRefresh={refreshStats}
        />
      </div>

      {/* Import/Export Panel */}
      <ImportExportPanel
        type="period"
        onImportComplete={handleImportComplete}
      />

      {/* Tabla con selección múltiple */}
      <div data-tour="periodos-search">
        <div data-tour="periodos-table">
          <TypologyTable
            type="period"
            data={periods}
            loading={loading}
            selected={selected}
            onSelect={toggleSelect}
            onSelectAll={(ids) => toggleSelectAll(ids)}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onView={openDetailModal}
            onBulkAction={handleBulkAction}
          />
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {modalMode === 'create' ? 'Crear Periodo' : 'Editar Periodo'}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                placeholder="Ingrese el año"
                min={1900}
                max={2100}
                disabled={modalMode === 'edit'}
              />
              {errors.year && (
                <p className="text-sm text-red-600 mt-1">{errors.year}</p>
              )}
              {modalMode === 'edit' && (
                <p className="text-sm text-gray-600 mt-1">
                  El año no puede modificarse una vez creado
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingrese una descripción (opcional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.year || !!errors.year}>
              {modalMode === 'create' ? 'Crear' : 'Guardar'}
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
    </div>
  );
}
