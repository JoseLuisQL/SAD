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
import { PasswordStrengthIndicator } from '@/components/shared/PasswordStrengthIndicator';
import { User, CreateUserData, UpdateUserData, Role } from '@/types/user.types';
import { rolesApi } from '@/lib/api/roles';
import { Loader2, Check } from 'lucide-react';

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos (_)'),
  email: z.string().email('Ingrese un email válido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  roleId: z.string().min(1, 'El rol es requerido'),
});

const updateUserSchema = z.object({
  email: z.string().email('Ingrese un email válido').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número')
    .optional()
    .or(z.literal('')),
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres').optional(),
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
      : {
          isActive: true,
        },
  });

  const isActive = watch('isActive');
  const selectedRoleId = watch('roleId');
  const password = watch('password') || '';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre de usuario */}
        {mode === 'create' && (
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="username" className="text-sm font-medium dark:text-slate-300">
              Nombre de usuario
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="ej: jperez"
              aria-required="true"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : 'username-hint'}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            {errors.username ? (
              <p id="username-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.username.message}
              </p>
            ) : (
              <p id="username-hint" className="text-xs text-gray-500 dark:text-slate-400">
                Solo letras, números y guiones bajos
              </p>
            )}
          </div>
        )}

        {mode === 'edit' && initialData && (
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="username-display" className="text-sm font-medium dark:text-slate-300">
              Nombre de usuario
            </Label>
            <Input
              id="username-display"
              value={initialData.username}
              disabled
              className="bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400">
              El nombre de usuario no se puede modificar
            </p>
          </div>
        )}

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium dark:text-slate-300">
            Nombre
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="ej: Juan"
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium dark:text-slate-300">
            Apellido
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="ej: Pérez García"
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="email" className="text-sm font-medium dark:text-slate-300">
            Email
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="ej: juan.perez@institucion.gob.pe"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="password" className="text-sm font-medium dark:text-slate-300">
            Contraseña
            {mode === 'create' && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            {mode === 'edit' && <span className="text-gray-500 dark:text-slate-400 ml-1 text-xs font-normal">(Opcional)</span>}
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder={mode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
            aria-required={mode === 'create'}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {errors.password ? (
            <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.password.message}
            </p>
          ) : (
            <p id="password-requirements" className="text-xs text-gray-500 dark:text-slate-400">
              Mínimo 8 caracteres, una mayúscula y un número
            </p>
          )}
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Rol */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="roleId" className="text-sm font-medium dark:text-slate-300">
            Rol
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </Label>
          <Select
            value={selectedRoleId}
            onValueChange={(value) => setValue('roleId', value)}
            disabled={loadingRoles}
          >
            <SelectTrigger 
              id="roleId"
              aria-required="true"
              aria-invalid={!!errors.roleId}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <SelectValue placeholder={loadingRoles ? 'Cargando roles...' : 'Seleccione un rol'} />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {roles.map((role) => (
                <SelectItem 
                  key={role.id} 
                  value={role.id} 
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <div className="flex flex-col">
                    <span>{role.name}</span>
                    {role.description && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {role.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleId && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.roleId.message}
            </p>
          )}
        </div>

        {/* Estado (solo en edición) */}
        {mode === 'edit' && (
          <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium dark:text-slate-300">
                Usuario Activo
              </Label>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Los usuarios inactivos no pueden acceder al sistema
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              aria-describedby="isActive-description"
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={submitting}
          className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={submitting}
          className="min-w-[140px]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
