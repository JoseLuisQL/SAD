'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, CreateUserData, UpdateUserData, Role } from '@/types/user.types';
import { rolesApi } from '@/lib/api/roles';
import { Loader2 } from 'lucide-react';

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  roleId: z.string().min(1, 'El rol es requerido'),
});

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  firstName: z.string().min(1, 'El nombre es requerido').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').optional(),
  roleId: z.string().min(1, 'El rol es requerido').optional(),
  isActive: z.boolean().optional(),
});

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: User;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ mode, initialData, onSubmit, onCancel }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schema = mode === 'create' ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          email: initialData.email,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          roleId: initialData.roleId,
          isActive: initialData.isActive,
        }
      : {},
  });

  const isActive = watch('isActive');
  const selectedRoleId = watch('roleId');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await rolesApi.getAll();
        const rolesData = response.data as { status: string; message: string; data: Role[] };
        setRoles(rolesData.data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleFormSubmit = async (data: CreateUserData | UpdateUserData) => {
    try {
      setSubmitting(true);
      
      const cleanedData: CreateUserData | UpdateUserData = { ...data };
      if ('password' in cleanedData && !cleanedData.password) {
        delete cleanedData.password;
      }
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {mode === 'create' && (
          <div className="col-span-2">
            <Label htmlFor="username" className="dark:text-slate-300">Nombre de Usuario</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="Ingrese nombre de usuario"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.username.message}</p>
            )}
          </div>
        )}

        {mode === 'edit' && initialData && (
          <div className="col-span-2">
            <Label htmlFor="username" className="dark:text-slate-300">Nombre de Usuario</Label>
            <Input
              id="username"
              value={initialData.username}
              disabled
              className="bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
            />
          </div>
        )}

        <div>
          <Label htmlFor="firstName" className="dark:text-slate-300">Nombre</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Ingrese nombre"
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="dark:text-slate-300">Apellido</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Ingrese apellido"
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.lastName.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="email" className="dark:text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="ejemplo@disa.gob.pe"
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="password" className="dark:text-slate-300">
            Contraseña {mode === 'edit' && '(Opcional)'}
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder={
              mode === 'create'
                ? 'Ingrese contraseña'
                : 'Dejar vacío para no cambiar'
            }
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="roleId" className="dark:text-slate-300">Rol</Label>
          <Select
            value={selectedRoleId}
            onValueChange={(value) => setValue('roleId', value)}
            disabled={loadingRoles}
          >
            <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id} className="dark:text-slate-200 dark:hover:bg-slate-700">
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleId && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.roleId.message}</p>
          )}
        </div>

        {mode === 'edit' && (
          <div className="col-span-2 flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive" className="dark:text-slate-300">Usuario Activo</Label>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear Usuario'
          ) : (
            'Actualizar Usuario'
          )}
        </Button>
      </div>
    </form>
  );
}
