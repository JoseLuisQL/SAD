'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Save } from 'lucide-react';
import { useConfigurationStore } from '@/store/configurationStore';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ConfigurationTabs } from '@/components/configuration/ConfigurationTabs';
import { UnsavedChangesBar } from '@/components/configuration/UnsavedChangesBar';
import { generalConfigSchema, GeneralConfigFormData, AssetType } from '@/components/configuration/configuration.types';

export default function ConfiguracionPage() {
  const { config, isLoading, fetchConfig, saveGeneral, uploadAsset, removeAsset, updateExternalUrls } = useConfigurationStore();
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const [urlsChanged, setUrlsChanged] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GeneralConfigFormData>({
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

      const extractedLogoUrl = !config.hasLocalLogo && config.logoUrl ? config.logoUrl : null;
      const extractedFaviconUrl = !config.hasLocalFavicon && config.faviconUrl ? config.faviconUrl : null;
      const extractedStampUrl = !config.hasLocalStamp && config.stampUrl ? config.stampUrl : null;

      setLogoUrl(extractedLogoUrl);
      setFaviconUrl(extractedFaviconUrl);
      setStampUrl(extractedStampUrl);
      setUrlsChanged(false);
    }
  }, [config, reset]);

  const onSubmit = async (data: GeneralConfigFormData) => {
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

      if (urlsChanged) {
        await updateExternalUrls({
          logoUrl,
          faviconUrl,
          stampUrl,
        });
        setUrlsChanged(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUrlChange = (type: 'logo' | 'favicon' | 'stamp', url: string | null) => {
    if (type === 'logo') {
      setLogoUrl(url);
    } else if (type === 'favicon') {
      setFaviconUrl(url);
    } else if (type === 'stamp') {
      setStampUrl(url);
    }
    setUrlsChanged(true);
  };

  const handleUploadAsset = async (type: AssetType, file: File) => {
    await uploadAsset(type, file);
  };

  const handleRemoveAsset = async (type: AssetType) => {
    await removeAsset(type);
  };

  const handleDiscardChanges = () => {
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

      const extractedLogoUrl = !config.hasLocalLogo && config.logoUrl ? config.logoUrl : null;
      const extractedFaviconUrl = !config.hasLocalFavicon && config.faviconUrl ? config.faviconUrl : null;
      const extractedStampUrl = !config.hasLocalStamp && config.stampUrl ? config.stampUrl : null;

      setLogoUrl(extractedLogoUrl);
      setFaviconUrl(extractedFaviconUrl);
      setStampUrl(extractedStampUrl);
      setUrlsChanged(false);
    }
  };

  const hasChanges = isDirty || urlsChanged;

  if (isLoading && !config) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="space-y-4">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Configuracion', href: '/dashboard/configuracion' },
              ]}
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950">
                  <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Configuracion del Sistema
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-sm md:text-base">
                    Administre la informacion corporativa, branding y preferencias
                  </p>
                </div>
              </div>

              {/* Desktop save button */}
              <div className="hidden lg:block">
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!hasChanges || isSaving}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <ConfigurationTabs
              config={config}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              logoUrl={logoUrl}
              faviconUrl={faviconUrl}
              stampUrl={stampUrl}
              onUrlChange={handleUrlChange}
              onUploadAsset={handleUploadAsset}
              onRemoveAsset={handleRemoveAsset}
            />
          </form>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <UnsavedChangesBar
        isDirty={hasChanges}
        isSaving={isSaving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={handleDiscardChanges}
      />
    </div>
  );
}
