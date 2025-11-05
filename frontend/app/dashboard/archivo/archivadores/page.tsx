'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useArchivadorAnalytics } from '@/hooks/useArchivadorAnalytics';
import { usePeriods } from '@/hooks/usePeriods';
import { 
  Archivador, 
  ArchivadorWithDocuments,
  CreateArchivadorData, 
  UpdateArchivadorData, 
  ArchivadoresFilters 
} from '@/types/archivador.types';
import { Archive, Plus, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArchivadorMetrics } from '@/components/archivo/archivadores/ArchivadorMetrics';
import { ArchivadoresTable } from '@/components/archivo/archivadores/ArchivadoresTable';
import { ArchivadorDrawer } from '@/components/archivo/archivadores/ArchivadorDrawer';
import { FiltersToolbar, ActiveFilter } from '@/components/shared/FiltersToolbar';

export default function ArchivadoresPage() {
  const { 
    archivadores, 
    loading, 
    pagination, 
    fetchArchivadores, 
    getArchivadorById,
    createArchivador, 
    updateArchivador, 
    deleteArchivador 
  } = useArchivadores();
  
  const { overview, loading: loadingAnalytics, fetchOverview } = useArchivadorAnalytics();
  const { periods, fetchPeriods } = usePeriods();
  
  // UI State
  // const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // For future grid view
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedArchivador, setSelectedArchivador] = useState<Archivador | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archivadorToDelete, setArchivadorToDelete] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerArchivador, setDrawerArchivador] = useState<ArchivadorWithDocuments | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ArchivadoresFilters>({ page: 1, limit: 10 });

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    periodId: string;
    physicalLocation: {
      estante: string;
      modulo: string;
      descripcion?: string;
    };
  }>({
    code: '',
    name: '',
    periodId: '',
    physicalLocation: {
      estante: '',
      modulo: '',
      descripcion: '',
    },
  });

  const [errors, setErrors] = useState({
    code: '',
    name: '',
    periodId: '',
    estante: '',
    modulo: '',
  });

  useEffect(() => {
    fetchArchivadores(currentFilters);
    fetchPeriods();
    fetchOverview();
  }, [fetchArchivadores, fetchPeriods, fetchOverview, currentFilters]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedArchivador(null);
    setFormData({
      code: '',
      name: '',
      periodId: '',
      physicalLocation: { estante: '', modulo: '', descripcion: '' },
    });
    setErrors({ code: '', name: '', periodId: '', estante: '', modulo: '' });
    setModalOpen(true);
  };

  const openEditModal = (archivador: Archivador) => {
    setModalMode('edit');
    setSelectedArchivador(archivador);
    setFormData({
      code: archivador.code,
      name: archivador.name,
      periodId: archivador.periodId,
      physicalLocation: archivador.physicalLocation,
    });
    setErrors({ code: '', name: '', periodId: '', estante: '', modulo: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedArchivador(null);
    setFormData({
      code: '',
      name: '',
      periodId: '',
      physicalLocation: { estante: '', modulo: '', descripcion: '' },
    });
    setErrors({ code: '', name: '', periodId: '', estante: '', modulo: '' });
  };

  const openDeleteDialog = (archivadorId: string) => {
    setArchivadorToDelete(archivadorId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setArchivadorToDelete(null);
  };

  const openDrawer = async (archivador: Archivador) => {
    const detail = await getArchivadorById(archivador.id);
    if (detail) {
      setDrawerArchivador(detail);
      setDrawerOpen(true);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerArchivador(null);
  };

  const validateForm = () => {
    const newErrors = {
      code: '',
      name: '',
      periodId: '',
      estante: '',
      modulo: '',
    };
    let isValid = true;

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
      isValid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.periodId) {
      newErrors.periodId = 'El periodo es requerido';
      isValid = false;
    }

    if (!formData.physicalLocation.estante.trim()) {
      newErrors.estante = 'El estante es requerido';
      isValid = false;
    }

    if (!formData.physicalLocation.modulo.trim()) {
      newErrors.modulo = 'El módulo es requerido';
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
        await createArchivador(formData as CreateArchivadorData);
        await fetchArchivadores(currentFilters);
      } else if (selectedArchivador) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { code, ...updateData } = formData;
        await updateArchivador(selectedArchivador.id, updateData as UpdateArchivadorData);
      }
      closeModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleDelete = async () => {
    if (archivadorToDelete) {
      try {
        await deleteArchivador(archivadorToDelete);
        closeDeleteDialog();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleSearch = () => {
    setCurrentFilters({
      ...currentFilters,
      page: 1,
      search: searchQuery || undefined,
      periodId: periodFilter === 'all' ? undefined : periodFilter,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters({ ...currentFilters, page });
  };

  // Active Filters for FiltersToolbar
  const activeFilters: ActiveFilter[] = [];
  if (periodFilter && periodFilter !== 'all') {
    const period = periods.find((p) => p.id === periodFilter);
    if (period) {
      activeFilters.push({
        key: 'periodId',
        value: periodFilter,
        label: 'Periodo',
        displayValue: period.year.toString(),
      });
    }
  }

  const handleRemoveFilter = (key: string) => {
    if (key === 'periodId') {
      setPeriodFilter('all');
      setCurrentFilters({ ...currentFilters, page: 1, periodId: undefined });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPeriodFilter('all');
    setCurrentFilters({ page: 1, limit: 10 });
    fetchArchivadores({ page: 1, limit: 10 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Archive className="h-8 w-8" />
            Gestión de Archivadores
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">
            Administre los archivadores físicos del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateModal} data-tour="archivadores-create-button">
            <Plus className="mr-2 h-4 w-4" />
            Crear Archivador
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div data-tour="archivadores-stats">
        <ArchivadorMetrics data={overview} loading={loadingAnalytics} />
      </div>

      {/* Filters Toolbar */}
      <div data-tour="archivadores-search">
        <FiltersToolbar
          searchPlaceholder="Buscar por código o nombre..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          data-tour-filters="archivadores-filters"
        renderFilterContent={() => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="archivadores-filters">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Periodo</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Todos los periodos" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all">Todos los periodos</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        />
      </div>

      {/* Table/Grid View */}
      <div className="space-y-4">
        {/* View Toggle (for future implementation) */}
        {/* <div className="flex justify-end">
          <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-1" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-1" />
              Tarjetas
            </Button>
          </div>
        </div> */}

        {/* Data Table */}
        <div data-tour="archivadores-table">
          <ArchivadoresTable
            archivadores={archivadores}
            loading={loading}
            onDetail={openDrawer}
            onEdit={openEditModal}
          onDelete={(arch) => openDeleteDialog(arch.id)}
          />
        </div>

        {/* Pagination */}
        {!loading && archivadores.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} archivadores
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                {modalMode === 'create' ? 'Crear Archivador' : 'Editar Archivador'}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="dark:text-slate-200">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: ARCH-2025-001"
                  disabled={modalMode === 'edit'}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                />
                {errors.code && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.code}</p>
                )}
              </div>

              <div>
                <Label htmlFor="periodId" className="dark:text-slate-200">Periodo *</Label>
                <Select
                  value={formData.periodId}
                  onValueChange={(value) => setFormData({ ...formData, periodId: value })}
                >
                  <SelectTrigger id="periodId" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Seleccione periodo" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.periodId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.periodId}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="dark:text-slate-200">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese el nombre del archivador"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="border-t dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 dark:text-white">
                <MapPin className="h-4 w-4" />
                Ubicación Física
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estante" className="dark:text-slate-200">Estante *</Label>
                  <Input
                    id="estante"
                    value={formData.physicalLocation.estante}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physicalLocation: {
                          ...formData.physicalLocation,
                          estante: e.target.value,
                        },
                      })
                    }
                    placeholder="Ej: A, B, C..."
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                  {errors.estante && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.estante}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="modulo" className="dark:text-slate-200">Módulo *</Label>
                  <Input
                    id="modulo"
                    value={formData.physicalLocation.modulo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physicalLocation: {
                          ...formData.physicalLocation,
                          modulo: e.target.value,
                        },
                      })
                    }
                    placeholder="Ej: 1, 2, 3..."
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                  {errors.modulo && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.modulo}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="descripcion" className="dark:text-slate-200">Descripción Referencial</Label>
                <Textarea
                  id="descripcion"
                  value={formData.physicalLocation.descripcion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      physicalLocation: {
                        ...formData.physicalLocation,
                        descripcion: e.target.value,
                      },
                    })
                  }
                  placeholder="Descripción adicional de la ubicación (opcional)"
                  rows={3}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {modalMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Right Panel Drawer for Details */}
      <ArchivadorDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        archivador={drawerArchivador}
        documents={drawerArchivador?.documents}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Archivador"
        message="¿Está seguro de que desea eliminar este archivador? Solo se pueden eliminar archivadores sin documentos asociados."
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
