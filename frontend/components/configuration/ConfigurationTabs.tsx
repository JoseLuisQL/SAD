'use client';

import { Building2, Palette, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemConfig } from '@/types/configuration.types';
import { GeneralInfoTab } from './GeneralInfoTab';
import { BrandingTab } from './BrandingTab';
import { SystemPreferencesTab } from './SystemPreferencesTab';
import { ConfigurationFormProps, AssetType } from './configuration.types';

interface ConfigurationTabsProps extends ConfigurationFormProps {
  config: SystemConfig | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  stampUrl: string | null;
  onUrlChange: (type: 'logo' | 'favicon' | 'stamp', url: string | null) => void;
  onUploadAsset: (type: AssetType, file: File) => Promise<void>;
  onRemoveAsset: (type: AssetType) => Promise<void>;
}

export function ConfigurationTabs({
  config,
  register,
  watch,
  setValue,
  errors,
  logoUrl,
  faviconUrl,
  stampUrl,
  onUrlChange,
  onUploadAsset,
  onRemoveAsset,
}: ConfigurationTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <TabsTrigger
          value="general"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md transition-all"
        >
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Informacion General</span>
          <span className="sm:hidden">General</span>
        </TabsTrigger>
        <TabsTrigger
          value="branding"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md transition-all"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Branding</span>
          <span className="sm:hidden">Branding</span>
        </TabsTrigger>
        <TabsTrigger
          value="system"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md transition-all"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Sistema</span>
          <span className="sm:hidden">Sistema</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <GeneralInfoTab
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
      </TabsContent>

      <TabsContent value="branding" className="mt-6">
        <BrandingTab
          config={config}
          logoUrl={logoUrl}
          faviconUrl={faviconUrl}
          stampUrl={stampUrl}
          onUrlChange={onUrlChange}
          onUploadAsset={onUploadAsset}
          onRemoveAsset={onRemoveAsset}
        />
      </TabsContent>

      <TabsContent value="system" className="mt-6">
        <SystemPreferencesTab
          config={config}
          watch={watch}
          setValue={setValue}
        />
      </TabsContent>
    </Tabs>
  );
}
