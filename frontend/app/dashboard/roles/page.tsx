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
import { Shield, Plus, BarChart3, GitCompare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-gray-900 dark:text-white" />
            Gestión de Roles y Permisos
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Administra los roles del sistema y sus permisos
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Rol
        </Button>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <TabsTrigger 
            value="roles" 
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="comparison"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Comparación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {loading ? (
            <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
              <CardContent className="p-12">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <RolesTable
              roles={roles}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
              onViewPermissions={openViewPermissions}
              onDuplicate={openDuplicateDialog}
              onViewImpact={openImpactModal}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <RolesAnalytics />
        </TabsContent>

        <TabsContent value="comparison">
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
