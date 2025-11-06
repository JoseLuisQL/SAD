'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ExternalUrlInputProps {
  label: string;
  description: string;
  value: string | null;
  disabled: boolean;
  hasLocalImage: boolean;
  onChange: (url: string | null) => void;
  type?: 'logo' | 'favicon' | 'stamp';
}

export function ExternalUrlInput({
  label,
  description,
  value,
  disabled,
  hasLocalImage,
  onChange,
  type = 'logo'
}: ExternalUrlInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value);

  useEffect(() => {
    setInputValue(value || '');
    setPreviewUrl(value);
    if (value) {
      setIsValid(true);
    }
  }, [value]);

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;

    try {
      // Validar formato de URL
      const urlObj = new URL(url);
      
      // Validar que sea http o https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Validar que tenga una extensión de imagen común
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // Si tiene extensión de imagen o es de un servicio de hosting conocido, aceptarla
      const knownImageHosts = ['imgur.com', 'ibb.co', 'postimg.cc', 'cloudinary.com', 'imgbb.com'];
      const isKnownHost = knownImageHosts.some(host => urlObj.hostname.includes(host));
      
      if (hasImageExtension || isKnownHost) {
        // Intentar cargar la imagen pero no fallar si no se puede (CORS)
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => resolve(true);
          
          // Si falla la carga (puede ser CORS), aún así aceptar la URL si parece válida
          img.onerror = () => {
            // Si es de un host conocido o tiene extensión de imagen, aceptar de todos modos
            resolve(hasImageExtension || isKnownHost);
          };
          
          img.src = url;
          
          // Timeout después de 8 segundos
          setTimeout(() => {
            // Aceptar la URL si tiene formato válido
            resolve(hasImageExtension || isKnownHost);
          }, 8000);
        });
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      setIsValid(null);
      setPreviewUrl(null);
      onChange(null);
      return;
    }

    setIsValidating(true);
    const valid = await validateImageUrl(newValue);
    setIsValidating(false);
    setIsValid(valid);

    if (valid) {
      setPreviewUrl(newValue);
      onChange(newValue);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setIsValid(null);
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        {hasLocalImage && (
          <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            Imagen local activa
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Link2 className="w-4 h-4" />
          </div>
          <Input
            type="url"
            placeholder="https://ejemplo.com/imagen.png"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            className={`pl-10 pr-20 ${
              isValid === true 
                ? 'border-emerald-500 dark:border-emerald-600 focus-visible:ring-emerald-500' 
                : isValid === false 
                ? 'border-red-500 dark:border-red-600 focus-visible:ring-red-500'
                : ''
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isValidating && (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            )}
            {!isValidating && isValid === true && (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {inputValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            {!isValidating && isValid === false && (
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>

        {disabled && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Debe eliminar la imagen local primero para usar una URL externa
            </p>
          </div>
        )}

        {isValid === false && inputValue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              La URL no es válida o la imagen no se puede cargar. Verifique que la URL sea correcta y accesible.
            </p>
          </div>
        )}

        {previewUrl && isValid && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Vista Previa
            </p>
            <div className="flex items-center justify-center min-h-[120px] bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-4">
              <div className={`relative ${type === 'favicon' ? 'w-16 h-16' : 'w-full h-[120px]'}`}>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    // Si falla la carga de la imagen, mostrar un placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Si la imagen no se visualiza aquí, aún así se guardará la URL y funcionará en producción
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
