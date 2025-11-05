'use client';

import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RoleForm from './RoleForm';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (data: CreateRoleData | UpdateRoleData) => Promise<void>;
  isLoading?: boolean;
}

export default function RoleModal({ isOpen, onClose, role, onSubmit, isLoading }: RoleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400">
            {role 
              ? 'Modifica la información y permisos del rol'
              : 'Crea un nuevo rol y asigna los permisos correspondientes'
            }
          </DialogDescription>
        </DialogHeader>
        <RoleForm
          role={role}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
