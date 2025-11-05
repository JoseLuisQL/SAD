'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Calendar,
  MapPin,
  FileText,
  Building,
  BarChart3,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { RightPanelDrawer } from '@/components/shared/RightPanelDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archivador } from '@/types/archivador.types';
import { useArchivadorAnalytics } from '@/hooks/useArchivadorAnalytics';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface ArchivadorDrawerProps {
  open: boolean;
  onClose: () => void;
  archivador: Archivador | null;
  documents?: Array<{
    id: string;
    documentNumber: string;
    documentDate: string;
    sender: string;
    folioCount: number;
    documentType: {
      id: string;
      name: string;
    };
    office: {
      id: string;
      name: string;
    };
  }>;
}

export function ArchivadorDrawer({
  open,
  onClose,
  archivador,
  documents = [],
}: ArchivadorDrawerProps) {
  const router = useRouter();
  const { detailAnalytics, loadingDetail, fetchDetailAnalytics, clearDetailAnalytics } =
    useArchivadorAnalytics();
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (open && archivador && activeTab === 'analytics') {
      fetchDetailAnalytics(archivador.id);
    }
  }, [open, archivador, activeTab, fetchDetailAnalytics]);

  useEffect(() => {
    if (!open) {
      clearDetailAnalytics();
      setActiveTab('info');
    }
  }, [open, clearDetailAnalytics]);

  if (!archivador) return null;

  const handleViewAllDocuments = () => {
    router.push(`/dashboard/archivo/documentos?archivadorId=${archivador.id}`);
    onClose();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'lleno':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medio':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'lleno':
        return 'Capacidad Alta';
      case 'medio':
        return 'Capacidad Media';
      default:
        return 'Capacidad Baja';
    }
  };

  return (
    <RightPanelDrawer
      open={open}
      onClose={onClose}
      title={archivador.code}
      subtitle={archivador.name}
      width="lg"
      footer={
        <Button onClick={handleViewAllDocuments} className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Ver todos los documentos
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-slate-800">
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:text-slate-400"
          >
            Información
          </TabsTrigger>
          <TabsTrigger 
            value="documents"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:text-slate-400"
          >
            Documentos
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:text-slate-400"
          >
            Analítica
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
            <CardHeader className="dark:bg-slate-800/50">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                <Archive className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 dark:bg-slate-800/30">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Código</p>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{archivador.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Nombre</p>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{archivador.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Periodo</p>
                <Badge variant="outline" className="flex items-center gap-1 w-fit dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
                  <Calendar className="h-3 w-3" />
                  {archivador.period.year}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Documentos</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                  <span className="font-semibold text-lg text-gray-900 dark:text-slate-100">
                    {documents?.length || archivador._count?.documents || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
            <CardHeader className="dark:bg-slate-800/50">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                <MapPin className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                Ubicación Física
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 dark:bg-slate-800/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Estante</p>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {archivador.physicalLocation.estante}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Módulo</p>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {archivador.physicalLocation.modulo}
                  </p>
                </div>
              </div>
              {archivador.physicalLocation.descripcion && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Descripción</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    {archivador.physicalLocation.descripcion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
            <CardHeader className="dark:bg-slate-800/50">
              <CardTitle className="text-sm text-gray-900 dark:text-slate-100 font-semibold">Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 dark:bg-slate-800/30">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Creado por</p>
                <p className="text-sm text-gray-900 dark:text-slate-100">
                  {archivador.creator.firstName} {archivador.creator.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">@{archivador.creator.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Fecha de creación</p>
                <p className="text-sm text-gray-900 dark:text-slate-100">
                  {format(new Date(archivador.createdAt), "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos Recientes */}
        <TabsContent value="documents" className="space-y-4 mt-6">
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/70 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-slate-400" />
                <p className="text-sm text-gray-500 dark:text-slate-300">
                  No hay documentos en este archivador
                </p>
              </div>
            ) : (
              documents.slice(0, 10).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between p-3 border border-gray-200 dark:border-slate-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors bg-white dark:bg-slate-800/50 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate">
                      {doc.documentNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{doc.sender}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs dark:bg-slate-700/70 dark:text-slate-300 dark:border-slate-600/50">
                        {doc.documentType.name}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {doc.office.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {format(new Date(doc.documentDate), 'dd/MM/yyyy')}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
                      {doc.folioCount} folios
                    </Badge>
                  </div>
                </div>
              ))
            )}

            {documents.length > 10 && (
              <p className="text-center text-sm text-gray-500 dark:text-slate-400 pt-2">
                ... y {documents.length - 10} documentos más
              </p>
            )}
          </div>
        </TabsContent>

        {/* Tab: Analítica */}
        <TabsContent value="analytics" className="space-y-4 mt-6">
          {loadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : detailAnalytics ? (
            <>
              <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
                <CardHeader className="dark:bg-slate-800/50">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                    <TrendingUp className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    Estado del Archivador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-300">Ocupación</span>
                    <Badge
                      className={getEstadoColor(detailAnalytics.estadoArchivador)}
                      variant="outline"
                    >
                      {getEstadoLabel(detailAnalytics.estadoArchivador)}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-slate-300">Capacidad utilizada</span>
                      <span className="font-semibold dark:text-slate-100">
                        {detailAnalytics.porcentajeOcupacion}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          detailAnalytics.estadoArchivador === 'lleno'
                            ? 'bg-red-500'
                            : detailAnalytics.estadoArchivador === 'medio'
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${detailAnalytics.porcentajeOcupacion}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-slate-300">Total documentos</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {detailAnalytics.totalDocumentos}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
                <CardHeader className="dark:bg-slate-800/50">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                    <BarChart3 className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    Distribución por Tipo de Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="dark:bg-slate-800/30">
                  <div className="space-y-3">
                    {detailAnalytics.distribucionPorTipo.map((item) => (
                      <div key={item.tipo}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-300 truncate">{item.tipo}</span>
                          <span className="font-semibold dark:text-slate-100">{item.cantidad}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.cantidad / detailAnalytics.totalDocumentos) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
                <CardHeader className="dark:bg-slate-800/50">
                  <CardTitle className="text-sm text-gray-900 dark:text-slate-100 font-semibold">Top Oficinas</CardTitle>
                </CardHeader>
                <CardContent className="dark:bg-slate-800/30">
                  <div className="space-y-2">
                    {detailAnalytics.oficinasMasRepresentadas.map((item, index) => (
                      <div
                        key={item.oficina}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                            #{index + 1}
                          </span>
                          <Building className="h-3 w-3 text-gray-400 dark:text-slate-400" />
                          <span className="text-sm text-gray-900 dark:text-slate-100">{item.oficina}</span>
                        </div>
                        <Badge variant="secondary" className="dark:bg-slate-700/70 dark:text-slate-300">{item.cantidad}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {detailAnalytics.documentosPorMes.length > 0 && (
                <Card className="bg-white dark:bg-slate-800/70 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/50">
                  <CardHeader className="dark:bg-slate-800/50">
                    <CardTitle className="text-sm text-gray-900 dark:text-slate-100 font-semibold">Últimos 6 Meses</CardTitle>
                  </CardHeader>
                  <CardContent className="dark:bg-slate-800/30">
                    <div className="space-y-2">
                      {detailAnalytics.documentosPorMes.map((item) => (
                        <div
                          key={item.mes}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600 dark:text-slate-300">{item.mes}</span>
                          <span className="font-semibold dark:text-slate-100">{item.cantidad} docs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/70 rounded-lg border border-gray-200 dark:border-slate-700/50">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-slate-400" />
              <p className="text-sm text-gray-500 dark:text-slate-300">
                No hay datos analíticos disponibles
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </RightPanelDrawer>
  );
}
