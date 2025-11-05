'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Expediente, ExpedienteFormData } from '@/types/expediente.types';

interface ExpedienteFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpedienteFormData | Partial<ExpedienteFormData>) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Expediente;
}

export function ExpedienteFormDrawer({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
}: ExpedienteFormDrawerProps) {
  const [formData, setFormData] = useState<ExpedienteFormData>({
    code: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExpedienteFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
      });
    }
    setErrors({});
  }, [mode, initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExpedienteFormData, string>> = {};

    if (mode === 'create' && !formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

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
      setSaving(true);

      if (mode === 'create') {
        await onSubmit(formData);
      } else {
        const updateData: Partial<ExpedienteFormData> = {
          name: formData.name,
          description: formData.description,
        };
        await onSubmit(updateData);
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar expediente:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ExpedienteFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {mode === 'create' ? 'Crear Nuevo Expediente' : 'Editar Expediente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code" className="dark:text-slate-200">
                Código del Expediente <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ej: EXP-2024-001"
                disabled={mode === 'edit' || saving}
                className={errors.code ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.code}</p>
              )}
              {mode === 'edit' && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  El código no puede ser modificado
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name" className="dark:text-slate-200">
                Nombre del Expediente <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Expediente de Contratos 2024"
                disabled={saving}
                className={errors.name ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="dark:text-slate-200">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción detallada del expediente..."
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota:</strong> Los campos marcados con{' '}
                <span className="text-red-500 dark:text-red-400">*</span> son obligatorios. Una vez
                creado el expediente, podrás agregar documentos desde la vista de
                detalle.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : mode === 'create' ? (
                'Crear Expediente'
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
