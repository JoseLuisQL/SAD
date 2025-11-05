'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Expediente, ExpedienteFormData } from '@/types/expediente.types';
import { Loader2 } from 'lucide-react';

const createExpedienteSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z.string().optional(),
});

const updateExpedienteSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  description: z.string().optional(),
});

interface ExpedienteFormProps {
  mode: 'create' | 'edit';
  initialData?: Expediente;
  onSubmit: (data: ExpedienteFormData | Partial<ExpedienteFormData>) => Promise<void>;
  onCancel: () => void;
}

export function ExpedienteForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ExpedienteFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const schema = mode === 'create' ? createExpedienteSchema : updateExpedienteSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          description: initialData.description || '',
        }
      : {},
  });

  const handleFormSubmit = async (
    data: ExpedienteFormData | Partial<ExpedienteFormData>
  ) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">
            Código <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            {...register('code')}
            placeholder="Ej: EXP-2025-001"
            disabled={mode === 'edit'}
            className={mode === 'edit' ? 'bg-gray-100' : ''}
          />
          {errors.code && (
            <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
          )}
          {mode === 'edit' && (
            <p className="text-sm text-gray-500 mt-1">
              El código no puede ser modificado
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Ej: Expediente de Contratos 2025"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descripción opcional del expediente"
            rows={4}
            className="resize-none"
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear Expediente'
          ) : (
            'Actualizar Expediente'
          )}
        </Button>
      </div>
    </form>
  );
}
