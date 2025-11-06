'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Settings, Image as ImageIcon, Upload, Trash2, Save } from 'lucide-react';
import { useConfigurationStore } from '@/store/configurationStore';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Image from 'next/image';
import { BrandingAssetsSection } from '@/components/configuration/BrandingAssetsSection';
import { ExternalUrlsSection } from '@/components/configuration/ExternalUrlsSection';

const generalConfigSchema = z.object({
  companyName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  companyTagline: z.string().optional().nullable(),
  companyEmail: z.string().email('Email inválido').optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  supportEmail: z.string().email('Email de soporte inválido').optional().nullable(),
  websiteUrl: z.string().url('URL inválida').optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  accentColor: z.string().optional().nullable(),
  signatureStampEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});

type GeneralConfigForm = z.infer<typeof generalConfigSchema>;

export default function ConfiguracionPage() {
  const { config, isLoading, fetchConfig, saveGeneral, uploadAsset, removeAsset } = useConfigurationStore();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GeneralConfigForm>({
    resolver: zodResolver(generalConfigSchema),
    defaultValues: {
      companyName: '',
      companyTagline: null,
      companyEmail: null,
      contactPhone: null,
      supportEmail: null,
      websiteUrl: null,
      primaryColor: null,
      accentColor: null,
      signatureStampEnabled: true,
      maintenanceMode: false,
    },
  });

  const signatureStampEnabled = watch('signatureStampEnabled');
  const maintenanceMode = watch('maintenanceMode');

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      reset({
        companyName: config.companyName,
        companyTagline: config.companyTagline,
        companyEmail: config.companyEmail,
        contactPhone: config.contactPhone,
        supportEmail: config.supportEmail,
        websiteUrl: config.websiteUrl,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        signatureStampEnabled: config.signatureStampEnabled,
        maintenanceMode: config.maintenanceMode,
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: GeneralConfigForm) => {
    try {
      setIsSaving(true);
      const payload = {
        ...data,
        companyTagline: data.companyTagline || undefined,
        companyEmail: data.companyEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        supportEmail: data.supportEmail || undefined,
        websiteUrl: data.websiteUrl || undefined,
        primaryColor: data.primaryColor || undefined,
        accentColor: data.accentColor || undefined,
      };
      await saveGeneral(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PNG, JPG, SVG o WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      await uploadAsset('logo', file);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PNG, JPG, SVG o WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }

    try {
      setUploadingStamp(true);
      await uploadAsset('stamp', file);
    } finally {
      setUploadingStamp(false);
      if (stampInputRef.current) {
        stampInputRef.current.value = '';
      }
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PNG o ICO');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error('El archivo no debe superar 1MB');
      return;
    }

    try {
      setUploadingFavicon(true);
      await uploadAsset('favicon', file);
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) {
        faviconInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('¿Está seguro de eliminar el logo?')) return;
    await removeAsset('logo');
  };

  const handleRemoveFavicon = async () => {
    if (!confirm('¿Está seguro de eliminar el favicon?')) return;
    await removeAsset('favicon');
  };

  const handleRemoveStamp = async () => {
    if (!confirm('¿Está seguro de eliminar el sello de firma?')) return;
    await removeAsset('stamp');
  };

  if (isLoading && !config) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          <div className="space-y-4">
            <div className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" data-tour="configuracion-general" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" data-tour="configuracion-branding" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" data-tour="configuracion-firma" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Configuración', href: '/dashboard/configuracion' },
            ]}
          />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950">
              <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración del Sistema</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Administre la información corporativa, branding y preferencias del sistema
              </p>
            </div>
          </div>
        </div>

        {/* General Configuration Form */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl" data-tour="configuracion-general">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Datos Generales</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Información de la empresa y datos de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nombre de la Empresa <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Ej: Municipalidad Provincial"
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                    className={errors.companyName ? 'border-red-500 dark:border-red-400' : ''}
                  />
                  {errors.companyName && (
                    <p id="companyName-error" className="text-xs text-red-600 dark:text-red-400">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyTagline" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tagline / Lema
                  </Label>
                  <Input
                    id="companyTagline"
                    {...register('companyTagline')}
                    placeholder="Ej: Modernizando la gestión pública"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Frase breve que describe la institución</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Corporativo
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...register('companyEmail')}
                    placeholder="contacto@empresa.gob.pe"
                    aria-describedby={errors.companyEmail ? 'companyEmail-error' : undefined}
                    className={errors.companyEmail ? 'border-red-500 dark:border-red-400' : ''}
                  />
                  {errors.companyEmail && (
                    <p id="companyEmail-error" className="text-xs text-red-600 dark:text-red-400">
                      {errors.companyEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email de Soporte
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    {...register('supportEmail')}
                    placeholder="soporte@empresa.gob.pe"
                    aria-describedby={errors.supportEmail ? 'supportEmail-error' : undefined}
                    className={errors.supportEmail ? 'border-red-500 dark:border-red-400' : ''}
                  />
                  {errors.supportEmail && (
                    <p id="supportEmail-error" className="text-xs text-red-600 dark:text-red-400">
                      {errors.supportEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    placeholder="+51 1 234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sitio Web
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    {...register('websiteUrl')}
                    placeholder="https://www.empresa.gob.pe"
                    aria-describedby={errors.websiteUrl ? 'websiteUrl-error' : undefined}
                    className={errors.websiteUrl ? 'border-red-500 dark:border-red-400' : ''}
                  />
                  {errors.websiteUrl && (
                    <p id="websiteUrl-error" className="text-xs text-red-600 dark:text-red-400">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Color Primario
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      {...register('primaryColor')}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={watch('primaryColor') || '#3b82f6'}
                      onChange={(e) => setValue('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Color principal de la interfaz</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Color Secundario
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      {...register('accentColor')}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={watch('accentColor') || '#10b981'}
                      onChange={(e) => setValue('accentColor', e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Color para acentos y detalles</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isDirty || isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Branding Section */}
        <div className="grid md:grid-cols-3 gap-6" data-tour="configuracion-branding">
          {/* Logo Card */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Logo Principal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Imagen institucional que aparece en la aplicación
                </p>
              </div>

              <div className="flex items-center justify-center min-h-[180px] bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                {config?.logoUrl ? (
                  <div className="relative w-full h-[180px] p-4">
                    <Image
                      src={config.logoUrl}
                      alt="Logo corporativo"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sin logo configurado</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="gap-2 border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingLogo ? 'Subiendo...' : 'Subir'}
                  </Button>
                  {config?.logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formatos: PNG, JPG, SVG, WebP • Tamaño máximo: 5MB
              </p>
            </div>
          </Card>

          {/* Stamp Card */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sello de Firma Perú</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Imagen estampada en documentos firmados digitalmente
                </p>
              </div>

              <div className="flex items-center justify-center min-h-[180px] bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                {config?.stampUrl ? (
                  <div className="relative w-full h-[180px] p-4">
                    <Image
                      src={config.stampUrl}
                      alt="Sello de firma"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sin sello configurado</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <input
                    ref={stampInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleStampUpload}
                    className="hidden"
                    id="stamp-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingStamp}
                    onClick={() => stampInputRef.current?.click()}
                    className="gap-2 border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingStamp ? 'Subiendo...' : 'Subir'}
                  </Button>
                  {config?.stampUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveStamp}
                      className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formatos: PNG, JPG, SVG, WebP • Tamaño máximo: 5MB
              </p>
            </div>
          </Card>

          {/* Favicon Card */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Favicon (Icono de pestaña)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Icono que aparece en la pestaña del navegador
                </p>
              </div>

              <div className="flex items-center justify-center min-h-[180px] bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                {config?.faviconUrl ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={config.faviconUrl}
                      alt="Favicon"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sin favicon configurado</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingFavicon}
                    onClick={() => faviconInputRef.current?.click()}
                    className="gap-2 border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingFavicon ? 'Subiendo...' : 'Subir'}
                  </Button>
                  {config?.faviconUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFavicon}
                      className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formatos: PNG, ICO • Tamaño máximo: 1MB • Recomendado: 32x32px o 16x16px
              </p>
            </div>
          </Card>
        </div>

        {/* External URLs Section */}
        <ExternalUrlsSection onUpdate={fetchConfig} />

        {/* Login Backgrounds Section */}
        <BrandingAssetsSection
          config={config}
          onUploadAsset={uploadAsset}
          onRemoveAsset={removeAsset}
        />

        {/* System Controls */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl" data-tour="configuracion-firma">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Controles del Sistema</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configuraciones adicionales y funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="signatureStampEnabled" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                    Sello en Firmas Digitales
                  </Label>
                  <Badge
                    className={
                      signatureStampEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }
                  >
                    {signatureStampEnabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Estampa automáticamente el logo institucional en documentos firmados
                </p>
              </div>
              <Switch
                id="signatureStampEnabled"
                checked={signatureStampEnabled}
                onCheckedChange={(checked) => setValue('signatureStampEnabled', checked, { shouldDirty: true })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maintenanceMode" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                    Modo Mantenimiento
                  </Label>
                  <Badge
                    className={
                      maintenanceMode
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    }
                  >
                    {maintenanceMode ? 'Mantenimiento' : 'Operativo'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Restringe el acceso al sistema excepto para administradores
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={maintenanceMode}
                onCheckedChange={(checked) => setValue('maintenanceMode', checked, { shouldDirty: true })}
              />
            </div>

            {config && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Última actualización:</span>{' '}
                    {new Date(config.updatedAt).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
