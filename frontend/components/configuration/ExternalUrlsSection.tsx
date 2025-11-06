'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link as LinkIcon, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { configurationApi } from '@/lib/api/configuration';

const externalUrlsSchema = z.object({
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  stampUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  loginBg1Url: z.string().url('URL inválida').optional().or(z.literal('')),
  loginBg2Url: z.string().url('URL inválida').optional().or(z.literal('')),
  loginBg3Url: z.string().url('URL inválida').optional().or(z.literal('')),
  loginBg4Url: z.string().url('URL inválida').optional().or(z.literal('')),
  loginBg5Url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ExternalUrlsForm = z.infer<typeof externalUrlsSchema>;

interface ExternalUrlsSectionProps {
  onUpdate: () => void;
}

export function ExternalUrlsSection({ onUpdate }: ExternalUrlsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ExternalUrlsForm>({
    resolver: zodResolver(externalUrlsSchema),
    defaultValues: {
      logoUrl: '',
      faviconUrl: '',
      stampUrl: '',
      loginBg1Url: '',
      loginBg2Url: '',
      loginBg3Url: '',
      loginBg4Url: '',
      loginBg5Url: '',
    }
  });

  const onSubmit = async (data: ExternalUrlsForm) => {
    try {
      setIsSaving(true);

      // Convertir strings vacíos a null
      const payload = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
      );

      await configurationApi.updateExternalUrls(payload);

      toast.success('URLs externas actualizadas correctamente');
      onUpdate();
      reset(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar las URLs');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          <CardTitle>URLs Externas de Imágenes</CardTitle>
        </div>
        <CardDescription>
          Configura URLs externas para las imágenes del sistema (ImgBB, Cloudinary, etc.)
          <br />
          <span className="text-xs text-muted-foreground mt-1 block">
            Las URLs externas tienen prioridad sobre los archivos subidos localmente
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo Principal</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://i.ibb.co/xxxxx/logo.png"
              {...register('logoUrl')}
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: PNG, JPG, SVG, WebP • Tamaño máximo: 5MB
            </p>
          </div>

          {/* Sello de Firma */}
          <div className="space-y-2">
            <Label htmlFor="stampUrl">Sello de Firma Perú</Label>
            <Input
              id="stampUrl"
              type="url"
              placeholder="https://i.ibb.co/xxxxx/stamp.png"
              {...register('stampUrl')}
            />
            {errors.stampUrl && (
              <p className="text-sm text-red-500">{errors.stampUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Imagen estampada en documentos firmados digitalmente
            </p>
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon (Ícono de pestaña)</Label>
            <Input
              id="faviconUrl"
              type="url"
              placeholder="https://i.ibb.co/xxxxx/favicon.ico"
              {...register('faviconUrl')}
            />
            {errors.faviconUrl && (
              <p className="text-sm text-red-500">{errors.faviconUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: PNG, ICO • Tamaño recomendado: 32×32px o 16×16px
            </p>
          </div>

          {/* Login Backgrounds */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Fondos de Pantalla de Login</h4>
            
            {[1, 2, 3, 4, 5].map((slot) => (
              <div key={slot} className="space-y-2">
                <Label htmlFor={`loginBg${slot}Url`}>
                  Fondo de Login {slot}
                </Label>
                <Input
                  id={`loginBg${slot}Url`}
                  type="url"
                  placeholder={`https://i.ibb.co/xxxxx/background${slot}.jpg`}
                  {...register(`loginBg${slot}Url` as keyof ExternalUrlsForm)}
                />
                {errors[`loginBg${slot}Url` as keyof ExternalUrlsForm] && (
                  <p className="text-sm text-red-500">
                    {errors[`loginBg${slot}Url` as keyof ExternalUrlsForm]?.message}
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Formatos: PNG, JPG, WebP • Tamaño máximo: 10MB cada uno
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar URLs Externas
                </>
              )}
            </Button>
          </div>

          {isDirty && (
            <p className="text-xs text-amber-600">
              Tienes cambios sin guardar
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
