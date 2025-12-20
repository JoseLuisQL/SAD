'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

type AspectRatio = 'square' | 'video' | 'logo';

interface ImageUploadCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  aspectRatio?: AspectRatio;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  acceptedFormats: string[];
  acceptedMimeTypes: string[];
  maxSizeMB: number;
  recommendedSize?: string;
}

const ASPECT_RATIO_CLASSES: Record<AspectRatio, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  logo: 'aspect-[3/2]',
};

export function ImageUploadCard({
  title,
  description,
  imageUrl,
  aspectRatio = 'logo',
  onUpload,
  onRemove,
  acceptedFormats,
  acceptedMimeTypes,
  maxSizeMB,
  recommendedSize,
}: ImageUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!acceptedMimeTypes.includes(file.type)) {
      toast.error(`Solo se permiten archivos ${acceptedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo no debe superar ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemoveClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onRemove();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const inputId = `upload-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`relative bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden ${ASPECT_RATIO_CLASSES[aspectRatio]}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain p-3"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={acceptedMimeTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
            aria-describedby={`${inputId}-description`}
          />
          <label htmlFor={inputId} className="sr-only">
            Seleccionar archivo para {title}
          </label>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                  className="flex-1 gap-2 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
                  aria-label={imageUrl ? `Cambiar ${title}` : `Subir ${title}`}
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Subiendo...' : imageUrl ? 'Cambiar' : 'Subir'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Subir nueva imagen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {imageUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveClick}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    aria-label={`Eliminar ${title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar imagen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <p
          id={`${inputId}-description`}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          <span className="font-medium">Formatos:</span> {acceptedFormats.join(', ')} |{' '}
          <span className="font-medium">Max:</span> {maxSizeMB}MB
          {recommendedSize && (
            <>
              {' '}
              | <span className="font-medium">Recomendado:</span> {recommendedSize}
            </>
          )}
        </p>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Eliminar ${title}`}
        description={`Esta accion eliminara permanentemente ${title.toLowerCase()}. Los usuarios veran un placeholder hasta que se suba uno nuevo.`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
