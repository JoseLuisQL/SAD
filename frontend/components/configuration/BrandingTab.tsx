'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Image as ImageIcon, Link2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { SystemConfig } from '@/types/configuration.types';
import { ImageUploadCard } from './ImageUploadCard';
import { ExternalUrlInput } from './ExternalUrlInput';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

type AssetType = 'logo' | 'favicon' | 'stamp' | 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

interface BrandingTabProps {
  config: SystemConfig | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  stampUrl: string | null;
  onUrlChange: (type: 'logo' | 'favicon' | 'stamp', url: string | null) => void;
  onUploadAsset: (type: AssetType, file: File) => Promise<void>;
  onRemoveAsset: (type: AssetType) => Promise<void>;
}

export function BrandingTab({
  config,
  logoUrl,
  faviconUrl,
  stampUrl,
  onUrlChange,
  onUploadAsset,
  onRemoveAsset,
}: BrandingTabProps) {
  const [showExternalUrls, setShowExternalUrls] = useState(false);
  const [uploadingBg, setUploadingBg] = useState<Record<number, boolean>>({});
  const [deletingBg, setDeletingBg] = useState<number | null>(null);
  const [showDeleteBgDialog, setShowDeleteBgDialog] = useState(false);
  const [bgToDelete, setBgToDelete] = useState<number | null>(null);

  const bgInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const hasLocalLogo = config?.hasLocalLogo ?? false;
  const hasLocalFavicon = config?.hasLocalFavicon ?? false;
  const hasLocalStamp = config?.hasLocalStamp ?? false;

  const handleLoginBgUpload = async (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PNG, JPG o WebP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar 10MB');
      return;
    }

    try {
      setUploadingBg((prev) => ({ ...prev, [slot]: true }));
      await onUploadAsset(`loginBg${slot}` as AssetType, file);
    } finally {
      setUploadingBg((prev) => ({ ...prev, [slot]: false }));
      if (bgInputRefs[slot - 1]?.current) {
        bgInputRefs[slot - 1].current!.value = '';
      }
    }
  };

  const handleRemoveLoginBg = (slot: number) => {
    setBgToDelete(slot);
    setShowDeleteBgDialog(true);
  };

  const confirmDeleteBg = async () => {
    if (bgToDelete === null) return;
    try {
      setDeletingBg(bgToDelete);
      await onRemoveAsset(`loginBg${bgToDelete}` as AssetType);
      setShowDeleteBgDialog(false);
      setBgToDelete(null);
    } finally {
      setDeletingBg(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Imagenes Principales */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Imagenes Principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <ImageUploadCard
            title="Logo Principal"
            description="Imagen institucional de la aplicacion"
            imageUrl={config?.logoUrl || null}
            aspectRatio="logo"
            onUpload={(file) => onUploadAsset('logo', file)}
            onRemove={() => onRemoveAsset('logo')}
            acceptedFormats={['PNG', 'JPG', 'SVG', 'WebP']}
            acceptedMimeTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']}
            maxSizeMB={5}
          />

          <ImageUploadCard
            title="Sello de Firma Peru"
            description="Estampado en documentos firmados"
            imageUrl={config?.stampUrl || null}
            aspectRatio="logo"
            onUpload={(file) => onUploadAsset('stamp', file)}
            onRemove={() => onRemoveAsset('stamp')}
            acceptedFormats={['PNG', 'JPG', 'SVG', 'WebP']}
            acceptedMimeTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']}
            maxSizeMB={5}
          />

          <ImageUploadCard
            title="Favicon"
            description="Icono de pestana del navegador"
            imageUrl={config?.faviconUrl || null}
            aspectRatio="square"
            onUpload={(file) => onUploadAsset('favicon', file)}
            onRemove={() => onRemoveAsset('favicon')}
            acceptedFormats={['PNG', 'ICO']}
            acceptedMimeTypes={['image/png', 'image/x-icon', 'image/vnd.microsoft.icon']}
            maxSizeMB={1}
            recommendedSize="32x32px"
          />
        </div>
      </div>

      {/* URLs Externas (Colapsable) */}
      <Collapsible open={showExternalUrls} onOpenChange={setShowExternalUrls}>
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl"
              aria-expanded={showExternalUrls}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Link2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    URLs Externas
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Usar imagenes alojadas en servidores externos
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  showExternalUrls ? 'rotate-180' : ''
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-5 space-y-4">
              <ExternalUrlInput
                label="URL Externa del Logo"
                description="Ingrese una URL si desea usar una imagen alojada externamente"
                value={logoUrl}
                disabled={hasLocalLogo}
                hasLocalImage={hasLocalLogo}
                onChange={(url) => onUrlChange('logo', url)}
                type="logo"
              />
              <ExternalUrlInput
                label="URL Externa del Sello"
                description="Ingrese una URL si desea usar una imagen alojada externamente"
                value={stampUrl}
                disabled={hasLocalStamp}
                hasLocalImage={hasLocalStamp}
                onChange={(url) => onUrlChange('stamp', url)}
                type="stamp"
              />
              <ExternalUrlInput
                label="URL Externa del Favicon"
                description="Ingrese una URL si desea usar una imagen alojada externamente"
                value={faviconUrl}
                disabled={hasLocalFavicon}
                hasLocalImage={hasLocalFavicon}
                onChange={(url) => onUrlChange('favicon', url)}
                type="favicon"
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Fondos de Login */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950">
              <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Fondos de Pantalla Login
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Imagenes de fondo con transiciones automaticas (maximo 5)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((slot) => {
              const bgUrl = config?.loginBackgrounds?.[slot - 1];
              const isUploading = uploadingBg[slot];

              return (
                <div key={slot} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fondo {slot}
                    </span>
                    {bgUrl && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        Activo
                      </span>
                    )}
                  </div>

                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden relative">
                    {bgUrl ? (
                      <Image
                        src={bgUrl}
                        alt={`Fondo de login ${slot}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <input
                      ref={bgInputRefs[slot - 1]}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => handleLoginBgUpload(slot, e)}
                      className="hidden"
                      id={`login-bg-${slot}-upload`}
                      aria-label={`Subir fondo de login ${slot}`}
                    />
                    <label htmlFor={`login-bg-${slot}-upload`} className="sr-only">
                      Subir fondo de login {slot}
                    </label>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            onClick={() => bgInputRefs[slot - 1]?.current?.click()}
                            className="flex-1 text-xs h-8 border-slate-300 dark:border-slate-600"
                            aria-label={bgUrl ? `Cambiar fondo ${slot}` : `Subir fondo ${slot}`}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            {isUploading ? '...' : bgUrl ? 'Cambiar' : 'Subir'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bgUrl ? 'Cambiar imagen' : 'Subir imagen'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {bgUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLoginBg(slot)}
                              className="h-8 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                              aria-label={`Eliminar fondo ${slot}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar imagen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            <span className="font-medium">Formatos:</span> PNG, JPG, WebP |{' '}
            <span className="font-medium">Max:</span> 10MB |{' '}
            <span className="font-medium">Recomendado:</span> 1920x1080 o superior
          </p>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showDeleteBgDialog}
        onOpenChange={setShowDeleteBgDialog}
        title={`Eliminar Fondo ${bgToDelete}`}
        description="Esta accion eliminara permanentemente esta imagen de fondo del login."
        onConfirm={confirmDeleteBg}
        isLoading={deletingBg !== null}
      />
    </div>
  );
}
