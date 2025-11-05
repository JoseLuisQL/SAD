'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { officesApi } from '@/lib/api/offices';
import { documentTypesApi } from '@/lib/api/document-types';
import { periodsApi } from '@/lib/api/periods';
import { Calendar, FileText, CheckCircle, XCircle, Clock, User, Pencil } from 'lucide-react';
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

  const getTypeLabel = () => {
    switch (type) {
      case 'office':
        return { singular: 'Oficina', plural: 'Oficinas', metric: 'documentos' };
      case 'documentType':
        return { singular: 'Tipo de Documento', plural: 'Tipos', metric: 'documentos' };
      case 'period':
        return { singular: 'Periodo', plural: 'Periodos', metric: 'archivadores' };
    }
  };

  const labels = getTypeLabel();

  const handleEdit = () => {
    if (onEdit && data) {
      onEdit(data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between dark:text-white">
            <div className="flex items-center gap-3">
              <span>Detalle de {labels.singular}</span>
              {data && (
                <Badge 
                  variant={data.isActive ? 'default' : 'secondary'} 
                  className={data.isActive ? 'bg-green-600' : 'dark:bg-slate-700 dark:text-slate-300'}
                >
                  {data.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full dark:bg-slate-800" />
            <Skeleton className="h-48 w-full dark:bg-slate-800" />
            <Skeleton className="h-32 w-full dark:bg-slate-800" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Información Básica */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    {type === 'period' ? 'Año' : 'Código'}
                  </p>
                  <p className="font-mono font-bold text-2xl text-gray-900 dark:text-white">
                    {type === 'period' ? data.year : data.code}
                  </p>
                </div>
                {type !== 'period' && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Nombre</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{data.name}</p>
                  </div>
                )}
                <div className="col-span-full">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Descripción</p>
                  <p className="text-gray-900 dark:text-slate-200 leading-relaxed">
                    {data.description || 'Sin descripción'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Creación
                  </p>
                  <p className="text-gray-900 dark:text-slate-200">
                    {format(new Date(data.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Última Actualización
                  </p>
                  <p className="text-gray-900 dark:text-slate-200">
                    {format(new Date(data.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            </Card>

            <Separator className="dark:bg-slate-700" />

            {/* Estadísticas de Uso */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas de Uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Total {labels.metric}
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {data._count?.documents || data._count?.archivadores || 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Activos</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {data._count?.documents || data._count?.archivadores || 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900">
                      <XCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Inactivos</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">0</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Elementos Relacionados */}
            {(data.documents || data.archivadores) && (
              <>
                <Separator className="dark:bg-slate-700" />
                <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Elementos Relacionados
                  </h3>
                  {(data.documents?.length > 0 || data.archivadores?.length > 0) ? (
                    <div className="space-y-2">
                      {(data.documents || data.archivadores)?.slice(0, 5).map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-gray-600 dark:text-slate-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {item.title || item.name || `${labels.metric} ${index + 1}`}
                              </p>
                              {item.code && (
                                <p className="text-sm text-gray-600 dark:text-slate-400">Código: {item.code}</p>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={item.isActive ? 'default' : 'secondary'}
                            className={!item.isActive ? 'dark:bg-slate-600 dark:text-slate-300' : ''}
                          >
                            {item.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      ))}
                      {(data.documents?.length > 5 || data.archivadores?.length > 5) && (
                        <p className="text-sm text-center text-gray-600 dark:text-slate-400 mt-3">
                          ... y {(data.documents?.length || data.archivadores?.length) - 5} más
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-slate-400">
                        No hay {labels.metric} relacionados
                      </p>
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-slate-400">No se encontraron datos</p>
          </div>
        )}

        <DialogFooter>
          {onEdit && data && (
            <Button variant="outline" onClick={handleEdit} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
