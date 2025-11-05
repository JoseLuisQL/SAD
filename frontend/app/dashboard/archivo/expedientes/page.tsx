'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import ExpedientesTable from '@/components/expedientes/ExpedientesTable';
import { ExpedienteFormDrawer } from '@/components/expedientes/ExpedienteFormDrawer';
import { MetricsHero } from '@/components/expedientes/MetricsHero';
import { useExpedientes } from '@/hooks/useExpedientes';
import { Expediente, ExpedienteFormData, ExpedientesFilters } from '@/types/expediente.types';

export default function ExpedientesPage() {
  const router = useRouter();
  const {
    expedientes,
    loading,
    pagination,
    fetchExpedientes,
    createExpediente,
    updateExpediente,
    deleteExpediente,
  } = useExpedientes();

  const [filters, setFilters] = useState<ExpedientesFilters>({
    page: 1,
    limit: 10,
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [expedienteToDelete, setExpedienteToDelete] = useState<Expediente | null>(null);

  useEffect(() => {
    fetchExpedientes(filters);
  }, [filters.page, filters.limit, fetchExpedientes]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput, page: 1 });
    fetchExpedientes({ ...filters, search: searchInput, page: 1 });
  };

  const handleResetSearch = () => {
    setSearchInput('');
    const resetFilters: ExpedientesFilters = {
      page: 1,
      limit: 10,
      search: '',
    };
    setFilters(resetFilters);
    fetchExpedientes(resetFilters);
  };

  const handleView = (expediente: Expediente) => {
    router.push(`/dashboard/archivo/expedientes/${expediente.id}`);
  };

  const handleEdit = (expediente: Expediente) => {
    setSelectedExpediente(expediente);
    setShowEditModal(true);
  };

  const handleDelete = (expediente: Expediente) => {
    setExpedienteToDelete(expediente);
  };

  const handleCreateSubmit = async (data: ExpedienteFormData) => {
    await createExpediente(data);
    setShowCreateModal(false);
    fetchExpedientes(filters);
  };

  const handleEditSubmit = async (data: Partial<ExpedienteFormData>) => {
    if (selectedExpediente) {
      await updateExpediente(selectedExpediente.id, data);
      setShowEditModal(false);
      setSelectedExpediente(null);
      fetchExpedientes(filters);
    }
  };

  const handleDeleteConfirm = async () => {
    if (expedienteToDelete) {
      await deleteExpediente(expedienteToDelete.id);
      setExpedienteToDelete(null);
      fetchExpedientes(filters);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Expedientes Electrónicos
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Gestiona y organiza documentos relacionados en expedientes
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg" data-tour="expedientes-create-button">
          <Plus className="mr-2 h-5 w-5" />
          Nuevo Expediente
        </Button>
      </div>

      {/* Metrics Hero */}
      <div data-tour="expedientes-stats">
        <MetricsHero />
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" data-tour="expedientes-search">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Buscar por código o nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="default">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {filters.search && (
            <Button variant="outline" onClick={handleResetSearch}>
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" data-tour="expedientes-table">
        <ExpedientesTable
          expedientes={expedientes}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} expedientes
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

      {/* Form Drawer for Create */}
      <ExpedienteFormDrawer
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
      />

      {/* Form Drawer for Edit */}
      {selectedExpediente && (
        <ExpedienteFormDrawer
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpediente(null);
          }}
          onSubmit={handleEditSubmit}
          mode="edit"
          initialData={selectedExpediente}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!expedienteToDelete}
        onOpenChange={() => setExpedienteToDelete(null)}
      >
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Esta acción no se puede deshacer. El expediente{' '}
              <strong className="dark:text-slate-200">{expedienteToDelete?.code}</strong> será eliminado
              permanentemente.
            </AlertDialogDescription>
            {expedienteToDelete?._count?.documents &&
              expedienteToDelete._count.documents > 0 && (
                <div className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  ⚠️ Este expediente tiene {expedienteToDelete._count.documents}{' '}
                  documentos asociados. No se podrá eliminar hasta que se remuevan
                  todos los documentos.
                </div>
              )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                expedienteToDelete?._count?.documents
                  ? expedienteToDelete._count.documents > 0
                  : false
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
