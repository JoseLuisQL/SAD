'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUploader({
  files,
  onFilesChange,
  maxFiles = 1,
  maxSize = MAX_FILE_SIZE,
  accept = { 'application/pdf': ['.pdf'] },
  disabled = false,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = maxFiles === 1 ? acceptedFiles.slice(0, 1) : [...files, ...acceptedFiles];
      
      if (maxFiles > 1 && newFiles.length > maxFiles) {
        alert(`Máximo ${maxFiles} archivos permitidos`);
        return;
      }
      
      onFilesChange(newFiles);
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900',
          isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400' : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">Suelta los archivos aquí...</p>
        ) : (
          <>
            <p className="text-gray-700 dark:text-slate-200 mb-2 font-medium">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Solo archivos PDF, máximo {formatFileSize(maxSize)}
            </p>
            {maxFiles > 1 && (
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Máximo {maxFiles} archivos
              </p>
            )}
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400 font-medium mb-2">Archivos rechazados:</p>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}:{' '}
                {errors.map((e) => {
                  if (e.code === 'file-too-large') {
                    return `Archivo muy grande (máx. ${formatFileSize(maxSize)})`;
                  }
                  if (e.code === 'file-invalid-type') {
                    return 'Tipo de archivo no permitido (solo PDF)';
                  }
                  return e.message;
                }).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Archivos seleccionados ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="ml-2 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
