'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesTable from '@/components/roles/RolesTable';
import RoleModal from '@/components/roles/RoleModal';
import PermissionsPreview from '@/components/roles/PermissionsPreview';
import RolesAnalytics from '@/components/roles/RolesAnalytics';
import RolesComparison from '@/components/roles/RolesComparison';
import RoleImpactModal from '@/components/roles/RoleImpactModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useRoles } from '@/hooks/useRoles';
import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
import { Shield, Plus, BarChart3, GitCompare, Loader2 } from 'lucide-react';

export default function RolesPage() {
  const { roles, loading, fetchRoles, createRole, updateRole, deleteRole, duplicateRole } = useRoles();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState<Role | null>(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [impactRoleId, setImpactRoleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [roleToDuplicate, setRoleToDuplicate] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreateModal = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRole(null);
  };

  const openViewPermissions = (role: Role) => {
    setPreviewRole(role);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewRole(null);
  };

  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleSubmit = async (data: CreateRoleData | UpdateRoleData) => {
    try {
      setIsSubmitting(true);
      if (selectedRole) {
        await updateRole(selectedRole.id, data as UpdateRoleData);
      } else {
        await createRole(data as CreateRoleData);
      }
      closeModal();
    } catch (error: unknown) {
      console.error('Error al guardar rol:', error);
      // El toast ya se muestra en useRoles, no necesitamos hacer nada más aquí
      // El modal permanece abierto para que el usuario pueda corregir
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete.id);
        closeDeleteDialog();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };

  const openDuplicateDialog = (role: Role) => {
    setRoleToDuplicate(role);
    setNewRoleName(`${role.name} (Copia)`);
    setDuplicateDialogOpen(true);
  };

  const closeDuplicateDialog = () => {
    setDuplicateDialogOpen(false);
    setRoleToDuplicate(null);
    setNewRoleName('');
  };

  const handleDuplicate = async () => {
    if (roleToDuplicate && newRoleName.trim()) {
      try {
        setIsSubmitting(true);
        await duplicateRole(roleToDuplicate.id, newRoleName.trim());
        closeDuplicateDialog();
      } catch (error) {
        console.error('Error al duplicar rol:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openImpactModal = (role: Role) => {
    setImpactRoleId(role.id);
    setImpactOpen(true);
  };

  const closeImpactModal = () => {
    setImpactOpen(false);
    setImpactRoleId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Roles y Permisos
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 ml-12">
            {roles.length} rol{roles.length !== 1 ? 'es' : ''} configurado{roles.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Button onClick={openCreateModal} data-tour="roles-create-button" aria-label="Crear nuevo rol">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Crear Rol
        </Button>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="bg-transparent border-none gap-1 p-0">
          <TabsTrigger 
            value="roles" 
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 
                       data-[state=active]:dark:bg-blue-900/30 data-[state=active]:dark:text-blue-300
                       rounded-lg px-4 py-2 text-gray-600 dark:text-slate-400"
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900
                       dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white
                       text-gray-500 dark:text-slate-500 rounded-lg px-3 py-2 text-sm"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Estadisticas
          </TabsTrigger>
          <TabsTrigger 
            value="comparison"
            className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900
                       dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white
                       text-gray-500 dark:text-slate-500 rounded-lg px-3 py-2 text-sm"
          >
            <GitCompare className="h-4 w-4 mr-1.5" />
            Comparar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
              <div role="status" className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-500 dark:text-slate-400">Cargando roles...</span>
              </div>
            </div>
          ) : (
            <div data-tour="roles-stats">
              <div data-tour="roles-table">
                <RolesTable
                  roles={roles}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                  onViewPermissions={openViewPermissions}
                  onDuplicate={openDuplicateDialog}
                  onViewImpact={openImpactModal}
                  onCreateRole={openCreateModal}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <RolesAnalytics />
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <RolesComparison roles={roles} />
        </TabsContent>
      </Tabs>

      <RoleModal
        isOpen={modalOpen}
        onClose={closeModal}
        role={selectedRole}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <PermissionsPreview
        isOpen={previewOpen}
        onClose={closePreview}
        role={previewRole}
      />

      <RoleImpactModal
        isOpen={impactOpen}
        onClose={closeImpactModal}
        roleId={impactRoleId}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Rol"
        message={`¿Está seguro que desea eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer y podría afectar a usuarios que tengan este rol asignado.`}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />

      <ConfirmDialog
        open={duplicateDialogOpen}
        title="Duplicar Rol"
        message={
          <div className="space-y-4">
            <p>Duplicar el rol &quot;{roleToDuplicate?.name}&quot; con el siguiente nombre:</p>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Nombre del nuevo rol"
              disabled={isSubmitting}
            />
          </div>
        }
        variant="default"
        onConfirm={handleDuplicate}
        onCancel={closeDuplicateDialog}
        confirmText="Duplicar"
        cancelText="Cancelar"
      />
    </div>
  );
}
