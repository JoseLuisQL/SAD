'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersFilters } from '@/components/users/UsersFilters';
import { UserModal } from '@/components/users/UserModal';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { UsersStats } from '@/components/users/UsersStats';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUsers } from '@/hooks/useUsers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { User, UsersFilters as IUsersFilters, CreateUserData, UpdateUserData } from '@/types/user.types';
import { UserPlus, Users as UsersIcon, Download, FileText, FileSpreadsheet } from 'lucide-react';

export default function UsuariosPage() {
  const { 
    users, 
    stats,
    loading, 
    pagination, 
    fetchUsers, 
    fetchStats,
    createUser, 
    updateUser, 
    deleteUser,
    exportUsers
  } = useUsers();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentFilters, setCurrentFilters] = useState<IUsersFilters>({ page: 1, limit: 10 });
  const [exporting, setExporting] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    fetchUsers(currentFilters);
    fetchStats();
  }, [fetchUsers, fetchStats, currentFilters]);

  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedUser(null);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedUser(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  // Atajos de teclado
  useKeyboardShortcuts({
    create: openCreateModal,
    close: () => {
      if (deleteDialogOpen) {
        closeDeleteDialog();
      } else if (detailModalOpen) {
        closeDetailModal();
      } else if (modalOpen) {
        closeModal();
      }
    },
  });

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openDeleteDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const handleSave = async (data: CreateUserData | UpdateUserData) => {
    if (modalMode === 'create') {
      await createUser(data as CreateUserData);
    } else if (selectedUser) {
      await updateUser(selectedUser.id, data as UpdateUserData);
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      closeDeleteDialog();
    }
  };

  const handleFilter = (filters: IUsersFilters) => {
    setCurrentFilters({ ...filters, limit: pagination.limit });
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters({ ...currentFilters, page });
  };

  const handleLimitChange = (limit: number) => {
    setCurrentFilters({ ...currentFilters, page: 1, limit });
  };

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      await exportUsers(format, currentFilters);
    } finally {
      setExporting(false);
    }
  };

  const handleEditFromDetail = (user: User) => {
    closeDetailModal();
    openEditModal(user);
  };

  const handleClearFilters = () => {
    setCurrentFilters({ page: 1, limit: pagination.limit });
    setHasActiveFilters(false);
  };

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="h-6 w-6" aria-hidden="true" />
            Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {stats.totalUsers} usuarios registrados en el sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dropdown de exportación */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={exporting || users.length === 0}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
              <DropdownMenuItem 
                onClick={() => handleExport('csv')}
                className="dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('excel')}
                className="dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón crear usuario */}
          <Button onClick={openCreateModal} data-tour="usuarios-create-button">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </header>

      {/* Estadísticas compactas */}
      <section data-tour="usuarios-stats" aria-label="Estadísticas de usuarios">
        <UsersStats stats={stats} />
      </section>

      {/* Filtros */}
      <section data-tour="usuarios-search" aria-label="Filtros de búsqueda">
        <UsersFilters 
          onFilter={handleFilter} 
          onActiveFiltersChange={setHasActiveFilters}
        />
      </section>

      {/* Tabla de usuarios */}
      <section data-tour="usuarios-table" aria-label="Lista de usuarios">
        <UsersTable
          users={users}
          loading={loading}
          pagination={pagination}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
          onViewDetails={openDetailModal}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onCreateUser={openCreateModal}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      {/* Modal de crear/editar */}
      <UserModal
        open={modalOpen}
        mode={modalMode}
        user={selectedUser || undefined}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* Modal de detalles */}
      <UserDetailModal
        open={detailModalOpen}
        user={selectedUser}
        onClose={closeDetailModal}
        onEdit={handleEditFromDetail}
      />

      {/* Diálogo de confirmación de eliminación mejorado */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Usuario"
        message={
          userToDelete ? (
            <div className="space-y-3">
              <p>¿Está seguro que desea eliminar al usuario:</p>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {userToDelete.firstName} {userToDelete.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  @{userToDelete.username} • {userToDelete.email}
                </p>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                El usuario será desactivado y no podrá acceder al sistema.
              </p>
            </div>
          ) : 'Esta acción desactivará al usuario en el sistema.'
        }
        variant="danger"
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
