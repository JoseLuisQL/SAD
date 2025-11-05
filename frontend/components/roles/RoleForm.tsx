'use client';

import { useState, useEffect } from 'react';
import { Role, CreateRoleData, UpdateRoleData } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PermissionsEditor from './PermissionsEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    permissions: {} as Record<string, any>,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {},
      });
    }
  }, [role]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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

  const handlePermissionsChange = (permissions: Record<string, any>) => {
    setFormData({ ...formData, permissions });
  };

  const getTotalPermissionsCount = (): number => {
    let count = 0;
    Object.values(formData.permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
      }
    });
    return count;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <TabsTrigger 
            value="basic"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
          >
            Información Básica
          </TabsTrigger>
          <TabsTrigger 
            value="permissions"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-600 dark:text-slate-400"
          >
            Permisos ({getTotalPermissionsCount()})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-slate-300 font-medium">
              Nombre del Rol <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Supervisor"
              className={`border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-slate-300 font-medium">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las responsabilidades de este rol..."
              rows={4}
              className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
            />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asignar Permisos</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Selecciona los permisos que tendrá este rol
              </p>
            </div>
            <PermissionsEditor
              selectedPermissions={formData.permissions}
              onChange={handlePermissionsChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : role ? 'Actualizar Rol' : 'Crear Rol'}
        </Button>
      </div>
    </form>
  );
}
