'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { officesApi } from '@/lib/api/offices';
import { documentTypesApi } from '@/lib/api/document-types';
import { periodsApi } from '@/lib/api/periods';
import { Building2, Calendar, FileText, Clock, Pencil, Hash, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TypologyType = 'office' | 'documentType' | 'period';

interface TypologyDetailModalProps {
  type: TypologyType;
  id: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: any) => void;
}

export function TypologyDetailModal({ type, id, open, onClose, onEdit }: TypologyDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      fetchData();
    } else {
      setData(null);
    }
  }, [open, id]);

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      let response;

      switch (type) {
        case 'office':
          response = await officesApi.getById(id);
          break;
        case 'documentType':
          response = await documentTypesApi.getById(id);
          break;
        case 'period':
          response = await periodsApi.getById(id);
          break;
      }

      setData(response.data.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'office':
        return { 
          singular: 'Oficina', 
          plural: 'Oficinas', 
          metric: 'documentos',
          icon: Building2
        };
      case 'documentType':
        return { 
          singular: 'Tipo de Documento', 
          plural: 'Tipos', 
          metric: 'documentos',
          icon: FileText
        };
      case 'period':
        return { 
          singular: 'Periodo', 
          plural: 'Periodos', 
          metric: 'archivadores',
          icon: Calendar
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  const handleEdit = () => {
    if (onEdit && data) {
      onEdit(data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 dark:text-white">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <span>Detalle de {config.singular}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4" role="status" aria-label="Cargando detalle">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-24 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20 dark:bg-slate-800" />
                <Skeleton className="h-6 w-40 dark:bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-20 w-full dark:bg-slate-800" />
            <div className="flex gap-4">
              <Skeleton className="h-16 flex-1 dark:bg-slate-800" />
              <Skeleton className="h-16 flex-1 dark:bg-slate-800" />
            </div>
            <span className="sr-only">Cargando...</span>
          </div>
        ) : data ? (
          <div className="space-y-5 py-2">
            {/* Header con código y estado */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">
                    {type === 'period' ? 'Año' : 'Código'}
                  </p>
                  <p className="font-mono font-bold text-xl text-gray-900 dark:text-white">
                    {type === 'period' ? data.year : data.code}
                  </p>
                </div>
                {type !== 'period' && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Nombre</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                  </div>
                )}
              </div>
              <Badge 
                variant={data.isActive ? 'default' : 'secondary'} 
                className={data.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100' 
                  : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                }
              >
                {data.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="h-4 w-4 text-gray-400 dark:text-slate-500" aria-hidden="true" />
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Descripción
                </p>
              </div>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                {data.description || (
                  <span className="text-gray-400 dark:text-slate-500 italic">Sin descripción</span>
                )}
              </p>
            </div>

            {/* Stats compactas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {data._count?.documents || data._count?.archivadores || 0}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">
                  {config.metric}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Creado</p>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-0.5">
                  {format(new Date(data.createdAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Actualizado</p>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-0.5">
                  {format(new Date(data.updatedAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {/* Elementos relacionados - simplificado */}
            {(data.documents?.length > 0 || data.archivadores?.length > 0) && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {config.metric} recientes
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(data.documents || data.archivadores)?.slice(0, 3).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate text-gray-700 dark:text-slate-300">
                          {item.title || item.name || item.code || `${config.metric} ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(data.documents?.length > 3 || data.archivadores?.length > 3) && (
                    <p className="text-xs text-center text-gray-400 dark:text-slate-500 py-1">
                      +{(data.documents?.length || data.archivadores?.length) - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-500 dark:text-slate-400">No se encontraron datos</p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {onEdit && data && (
            <Button 
              variant="outline" 
              onClick={handleEdit} 
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
              Editar
            </Button>
          )}
          <Button 
            onClick={onClose}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
