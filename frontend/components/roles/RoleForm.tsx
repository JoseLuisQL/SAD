'use client';

import { useState, useEffect } from 'react';
import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import PermissionsEditor from './PermissionsEditor';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (data: CreateRoleData | UpdateRoleData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RoleForm({ role, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, Record<string, boolean>>,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean }>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {},
      });
    }
  }, [role]);

  const validateField = (field: string, value: string): string | undefined => {
    if (field === 'name' && !value.trim()) {
      return 'El nombre es requerido';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'name') => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData.name);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    if (touched.name) {
      const error = validateField('name', value);
      setErrors(prev => ({ ...prev, name: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setTouched({ name: true });
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        permissions: formData.permissions,
      });
    } catch (error) {
      console.error('Error al guardar rol:', error);
    }
  };

  const handlePermissionsChange = (permissions: Record<string, Record<string, boolean>>) => {
    setFormData({ ...formData, permissions });
  };

  const getTotalPermissionsCount = (): number => {
    let count = 0;
    Object.values(formData.permissions).forEach((modulePerms: Record<string, boolean>) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
      }
    });
    return count;
  };

  const isFormValid = formData.name.trim().length > 0;
  const permissionsCount = getTotalPermissionsCount();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seccion 1: Informacion del Rol */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
            1
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">Informacion del Rol</h3>
        </div>
        
        <div className="grid gap-4 pl-8">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm text-gray-700 dark:text-slate-300">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Ej: Supervisor, Digitador, Auditor"
              className={`max-w-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 ${touched.name && errors.name ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {touched.name && errors.name && (
              <p id="name-error" className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm text-gray-700 dark:text-slate-300">
              Descripcion
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe brevemente las responsabilidades de este rol..."
              rows={2}
              className="max-w-lg resize-none border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Seccion 2: Permisos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
              2
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Permisos</h3>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0"
          >
            {permissionsCount} seleccionado{permissionsCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="pl-8">
          <PermissionsEditor
            selectedPermissions={formData.permissions}
            onChange={handlePermissionsChange}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="text-xs text-gray-500 dark:text-slate-400">
          {isFormValid && permissionsCount > 0 
            ? 'Listo para guardar' 
            : isFormValid 
            ? 'Selecciona al menos un permiso' 
            : 'Ingresa un nombre para el rol'}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              role ? 'Guardar cambios' : 'Crear rol'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
