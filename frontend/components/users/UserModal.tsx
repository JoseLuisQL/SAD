'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';
import { User, CreateUserData, UpdateUserData } from '@/types/user.types';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  user?: User;
  onSave: (data: CreateUserData | UpdateUserData) => Promise<void>;
}

export function UserModal({ open, onClose, mode, user, onSave }: UserModalProps) {
  const handleSave = async (data: CreateUserData | UpdateUserData) => {
    await onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {mode === 'create'
              ? 'Complete el formulario para crear un nuevo usuario.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          mode={mode}
          initialData={user}
          onSubmit={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
