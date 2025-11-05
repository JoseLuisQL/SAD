'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersFilters } from '@/components/users/UsersFilters';
import { UserModal } from '@/components/users/UserModal';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { UsersStats } from '@/components/users/UsersStats';
import { UsersRoleChart } from '@/components/users/UsersRoleChart';
import { UsersExportPanel } from '@/components/users/UsersExportPanel';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUsers } from '@/hooks/useUsers';
import { User, UsersFilters as IUsersFilters, CreateUserData, UpdateUserData } from '@/types/user.types';
import { UserPlus, Users as UsersIcon } from 'lucide-react';

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
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<IUsersFilters>({ page: 1, limit: 10 });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchUsers(currentFilters);
    fetchStats();
  }, [fetchUsers, fetchStats, currentFilters]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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
      await deleteUser(userToDelete);
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

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedUser(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="h-8 w-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Administre los usuarios del sistema y sus permisos
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      <UsersStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsersRoleChart data={stats.usersByRole} />
        </div>
        <div className="space-y-4">
          <UsersExportPanel onExport={handleExport} exporting={exporting} />
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usuarios Recientes
            </h3>
            <div className="space-y-2">
              {stats.recentUsers?.slice(0, 5).map((user: User) => (
                <div key={user.id} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-xs">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user.role.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <UsersFilters onFilter={handleFilter} />

      <UsersTable
        users={users}
        loading={loading}
        pagination={pagination}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onViewDetails={openDetailModal}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <UserModal
        open={modalOpen}
        mode={modalMode}
        user={selectedUser || undefined}
        onClose={closeModal}
        onSave={handleSave}
      />

      <UserDetailModal
        open={detailModalOpen}
        user={selectedUser}
        onClose={closeDetailModal}
        onEdit={handleEditFromDetail}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Usuario"
        message="¿Está seguro que desea eliminar este usuario? Esta acción desactivará al usuario en el sistema."
        variant="danger"
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
