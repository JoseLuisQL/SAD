'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useOffices } from '@/hooks/useOffices';
import { useTypologyStats } from '@/hooks/useTypologyStats';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { Office, CreateOfficeData, UpdateOfficeData, OfficesFilters } from '@/types/typologies.types';
import { Building2, Plus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TypologyStats } from '@/components/typologies/TypologyStats';
import { ImportExportPanel } from '@/components/typologies/ImportExportPanel';
import { TypologyTable } from '@/components/typologies/TypologyTable';
import { TypologyDetailModal } from '@/components/typologies/TypologyDetailModal';
import { BulkActionDialog } from '@/components/typologies/BulkActionDialog';

export default function OficinasPage() {
  const { offices, loading, pagination, fetchOffices, createOffice, updateOffice, deleteOffice } = useOffices();
  const { stats, loading: statsLoading, refresh: refreshStats } = useTypologyStats('office');
  const { 
    selected, 
    isProcessing, 
    toggleSelect, 
    toggleSelectAll, 
    bulkDelete, 
    bulkActivate, 
    bulkDeactivate 
  } = useBulkOperations('office');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate'>('delete');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailOfficeId, setDetailOfficeId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentFilters, setCurrentFilters] = useState<OfficesFilters>({ page: 1, limit: 10 });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchOffices(currentFilters);
  }, [fetchOffices, currentFilters]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedOffice(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (office: Office) => {
    setModalMode('edit');
    setSelectedOffice(office);
    setFormData({
      name: office.name,
      description: office.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOffice(null);
    setFormData({ name: '', description: '' });
  };

  const openDetailModal = (officeId: string) => {
    setDetailOfficeId(officeId);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailOfficeId(null);
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
      fetchOffices(currentFilters);
      refreshStats();
    } catch (error) {
      console.error('Error en operación masiva:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await createOffice(formData as CreateOfficeData);
      } else if (selectedOffice) {
        await updateOffice(selectedOffice.id, formData as UpdateOfficeData);
      }
      closeModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    // Confirm with native dialog for quick delete
    if (window.confirm('¿Está seguro de que desea eliminar esta oficina?')) {
      try {
        await deleteOffice(id);
        fetchOffices(currentFilters);
        refreshStats();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleImportComplete = () => {
    fetchOffices(currentFilters);
    refreshStats();
  };

  const handleSearch = () => {
    setCurrentFilters({
      ...currentFilters,
      page: 1,
      search: searchQuery || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters({ ...currentFilters, page });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Oficinas</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Administre las oficinas del sistema
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Oficina
        </Button>
      </div>

      {/* Estadísticas */}
      <TypologyStats 
        type="office" 
        stats={stats} 
        loading={statsLoading}
        onRefresh={refreshStats}
      />

      {/* Import/Export Panel */}
      <ImportExportPanel
        type="office"
        currentFilters={currentFilters}
        onImportComplete={handleImportComplete}
      />

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200 dark:hover:bg-slate-700">Todos</SelectItem>
              <SelectItem value="active" className="dark:text-slate-200 dark:hover:bg-slate-700">Activos</SelectItem>
              <SelectItem value="inactive" className="dark:text-slate-200 dark:hover:bg-slate-700">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabla con selección múltiple */}
      <TypologyTable
        type="office"
        data={offices}
        loading={loading}
        selected={selected}
        onSelect={toggleSelect}
        onSelectAll={(ids) => toggleSelectAll(ids)}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onView={openDetailModal}
        onBulkAction={handleBulkAction}
      />

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Mostrando {offices.length} de {pagination.total} oficinas
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let page;
                  if (pagination.totalPages <= 5) {
                    page = i + 1;
                  } else if (pagination.page <= 3) {
                    page = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i;
                  } else {
                    page = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {modalMode === 'create' ? 'Crear Oficina' : 'Editar Oficina'}
              </div>
            </DialogTitle>
          </DialogHeader>

          {modalMode === 'edit' && selectedOffice && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Código:</span> {selectedOffice.code}
                <span className="text-xs ml-2">(generado automáticamente)</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="dark:text-slate-300">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese el nombre de la oficina"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="description" className="dark:text-slate-300">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingrese una descripción (opcional)"
                rows={3}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {modalMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle */}
      <TypologyDetailModal
        type="office"
        id={detailOfficeId}
        open={detailModalOpen}
        onClose={closeDetailModal}
        onEdit={(office) => {
          closeDetailModal();
          openEditModal(office);
        }}
      />

      {/* Dialog de Operaciones Masivas */}
      <BulkActionDialog
        open={bulkDialogOpen}
        operation={bulkOperation}
        items={offices.filter(o => selected.includes(o.id)).map(o => ({
          id: o.id,
          code: o.code,
          name: o.name
        }))}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkDialogOpen(false)}
        loading={isProcessing}
      />
    </div>
  );
}
