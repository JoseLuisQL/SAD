import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user.types';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Edit 
} from 'lucide-react';

interface UserDetailModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

export function UserDetailModal({ open, user, onClose, onEdit }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <UserIcon className="h-5 w-5" />
            Detalles del Usuario
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Información completa del usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">@{user.username}</p>
            </div>
            <div>
              {user.isActive ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                Información Personal
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-slate-200">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Usuario</p>
                    <p className="text-sm text-gray-900 dark:text-slate-200">{user.username}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                Rol y Permisos
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Rol</p>
                    <p className="text-sm text-gray-900 dark:text-slate-200">{user.role.name}</p>
                  </div>
                </div>

                {user.role.description && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-slate-400">{user.role.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.role.permissions && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                Permisos
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(user.role.permissions as Record<string, boolean>)
                  .filter(([_, value]) => value)
                  .map(([permission]) => (
                    <span
                      key={permission}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"
                    >
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
              Fechas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Fecha de Creación</p>
                  <p className="text-sm text-gray-900 dark:text-slate-200">
                    {new Date(user.createdAt).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Última Actualización</p>
                  <p className="text-sm text-gray-900 dark:text-slate-200">
                    {new Date(user.updatedAt).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {onEdit && (
            <Button onClick={() => onEdit(user)} variant="default">
              <Edit className="h-4 w-4 mr-2" />
              Editar Usuario
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
