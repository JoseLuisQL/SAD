'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type AssetType = 'logo' | 'favicon' | 'stamp' | 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

interface BrandingAssetsSectionProps {
  config: {
    faviconUrl: string | null;
    loginBackgrounds: string[];
  } | null;
  onUploadAsset: (type: AssetType, file: File) => Promise<void>;
  onRemoveAsset: (type: AssetType) => Promise<void>;
}

export function BrandingAssetsSection({
  config,
  onUploadAsset,
  onRemoveAsset
}: BrandingAssetsSectionProps) {
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBg, setUploadingBg] = useState<Record<number, boolean>>({});
  
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const bg1InputRef = useRef<HTMLInputElement>(null);
  const bg2InputRef = useRef<HTMLInputElement>(null);
  const bg3InputRef = useRef<HTMLInputElement>(null);
  const bg4InputRef = useRef<HTMLInputElement>(null);
  const bg5InputRef = useRef<HTMLInputElement>(null);

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
      await onUploadAsset('favicon' as AssetType, file);
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) {
        faviconInputRef.current.value = '';
      }
    }
  };

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
      setUploadingBg(prev => ({ ...prev, [slot]: true }));
      await onUploadAsset(`loginBg${slot}` as AssetType, file);
    } finally {
      setUploadingBg(prev => ({ ...prev, [slot]: false }));
      const refs = [null, bg1InputRef, bg2InputRef, bg3InputRef, bg4InputRef, bg5InputRef];
      if (refs[slot]?.current) {
        refs[slot]!.current!.value = '';
      }
    }
  };

  const handleRemoveFavicon = async () => {
    if (!confirm('¿Está seguro de eliminar el favicon?')) return;
    await onRemoveAsset('favicon' as AssetType);
  };

  const handleRemoveLoginBg = async (slot: number) => {
    if (!confirm(`¿Está seguro de eliminar la imagen de fondo ${slot}?`)) return;
    await onRemoveAsset(`loginBg${slot}` as AssetType);
  };

  const bgInputRefs = [null, bg1InputRef, bg2InputRef, bg3InputRef, bg4InputRef, bg5InputRef];

  return (
    <div className="space-y-6">
      {/* Login Backgrounds Section */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fondos de Pantalla Login</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Imágenes de fondo que se mostrarán en la página de login con transiciones automáticas (máximo 5)
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((slot) => {
              const bgUrl = config?.loginBackgrounds?.[slot - 1];
              const isUploading = uploadingBg[slot];

              return (
                <div key={slot} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fondo {slot}
                    </span>
                    {bgUrl && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                        Activo
                      </span>
                    )}
                  </div>

                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative">
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
                        <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      ref={bgInputRefs[slot]!}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => handleLoginBgUpload(slot, e)}
                      className="hidden"
                      id={`login-bg-${slot}-upload`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => bgInputRefs[slot]?.current?.click()}
                      className="flex-1 gap-2 text-xs border-slate-300 dark:border-slate-700"
                    >
                      <Upload className="w-3 h-3" />
                      {isUploading ? 'Subiendo...' : bgUrl ? 'Cambiar' : 'Subir'}
                    </Button>
                    {bgUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLoginBg(slot)}
                        className="gap-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Formatos:</strong> PNG, JPG, WebP • <strong>Tamaño máximo:</strong> 10MB por imagen
              <br />
              <strong>Recomendaciones:</strong> Imágenes de alta resolución (1920x1080 o superior), con elementos visuales que no interfieran con el contenido del login
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
