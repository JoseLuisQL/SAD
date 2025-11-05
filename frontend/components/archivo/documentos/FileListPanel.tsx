'use client';

import { CheckCircle, XCircle, Loader2, X, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'validating' | 'ready' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileListPanelProps {
  files: FileItem[];
  onRemoveFile: (id: string) => void;
  className?: string;
}

export function FileListPanel({ files, onRemoveFile, className }: FileListPanelProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-5 w-5 text-gray-400" />;
      case 'validating':
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'validating':
        return 'Validando...';
      case 'ready':
        return 'Listo';
      case 'uploading':
        return 'Subiendo...';
      case 'success':
        return 'Exitoso';
      case 'error':
        return 'Error';
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600';
      case 'validating':
      case 'uploading':
        return 'text-blue-600';
      case 'ready':
        return 'text-green-600';
      case 'success':
        return 'text-green-700 font-semibold';
      case 'error':
        return 'text-red-600';
    }
  };

  const stats = {
    total: files.length,
    ready: files.filter((f) => f.status === 'ready').length,
    success: files.filter((f) => f.status === 'success').length,
    error: files.filter((f) => f.status === 'error').length,
  };

  return (
    <Card className={cn('p-4 bg-white border-gray-200', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Archivos ({stats.total})
        </h3>
        <div className="flex gap-2 text-xs">
          {stats.ready > 0 && (
            <span className="text-green-600 font-medium">
              {stats.ready} listos
            </span>
          )}
          {stats.success > 0 && (
            <span className="text-green-700 font-semibold">
              {stats.success} exitosos
            </span>
          )}
          {stats.error > 0 && (
            <span className="text-red-600 font-medium">
              {stats.error} errores
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay archivos seleccionados</p>
          </div>
        ) : (
          files.map((fileItem) => (
            <div
              key={fileItem.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                fileItem.status === 'success' && 'bg-green-50 border-green-200',
                fileItem.status === 'error' && 'bg-red-50 border-red-200',
                fileItem.status === 'ready' && 'bg-blue-50 border-blue-200',
                (fileItem.status === 'pending' ||
                  fileItem.status === 'validating' ||
                  fileItem.status === 'uploading') &&
                  'bg-white border-gray-200'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(fileItem.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 font-medium">
                      {formatFileSize(fileItem.file.size)}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className={cn('text-xs', getStatusColor(fileItem.status))}>
                      {getStatusLabel(fileItem.status)}
                    </span>
                  </div>
                  {fileItem.error && (
                    <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                  )}
                </div>
              </div>
              {(fileItem.status === 'pending' || fileItem.status === 'ready') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFile(fileItem.id)}
                  className="flex-shrink-0 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
