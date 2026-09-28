'use client';

import React from 'react';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Laptop,
  Server,
  ShieldCheck,
  Calendar,
  ExternalLink,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSystemUpdater } from '@/hooks/useSystemUpdater';

export function SystemUpdatesTab() {
  const {
    isDesktop,
    currentVersion,
    status,
    updateInfo,
    progress,
    errorMessage,
    lastChecked,
    manualDownloadUrl,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  } = useSystemUpdater();

  const isChecking = status === 'checking';
  const isDownloading = status === 'downloading';
  const isDownloaded = status === 'downloaded';
  const isAvailable = status === 'available';
  const isUpToDate = status === 'not-available';
  const isError = status === 'error';

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatSpeed = (bytesPerSec: number): string => {
    if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
    const kb = bytesPerSec / 1024;
    if (kb > 1024) {
      return `${(kb / 1024).toFixed(1)} MB/s`;
    }
    return `${kb.toFixed(0)} KB/s`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjeta de Estado del Sistema y Versión Actual */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Versión y Actualizaciones del Sistema
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                  Administre las versiones, parches de seguridad y mejoras continuas de SAD
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-medium px-3 py-1 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Canal Oficial DISA Chincheros
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Versión Actual */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Versión Instalada
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  v{currentVersion}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {isDesktop ? 'Escritorio' : 'Web'}
                </span>
              </div>
            </div>

            {/* Entorno de Ejecución */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Entorno de Trabajo
              </span>
              <div className="flex items-center gap-2 mt-1">
                {isDesktop ? (
                  <>
                    <Laptop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Ejecutable Nativo (Windows x64)
                    </span>
                  </>
                ) : (
                  <>
                    <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Servidor / Navegador Web
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Última Comprobación */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Última Búsqueda
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {lastChecked
                    ? lastChecked.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) +
                      ' (' +
                      lastChecked.toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                      }) +
                      ')'
                    : 'Aún no realizada'}
                </span>
              </div>
            </div>

            {/* Acción de Comprobación */}
            <div className="flex items-center justify-center p-2">
              <Button
                type="button"
                onClick={checkForUpdates}
                disabled={isChecking || isDownloading || isDownloaded}
                className="w-full h-full min-h-[52px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium gap-2 shadow-sm rounded-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Verificando...' : 'Buscar Actualizaciones'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Estados de Comprobación y Actualización */}

      {/* A. Comprobando en proceso */}
      {isChecking && (
        <Card className="border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-6 text-center animate-pulse">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              Consultando actualizaciones disponibles...
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              Verificando firmas criptográficas y publicaciones en el repositorio oficial de la institución.
            </p>
          </div>
        </Card>
      )}

      {/* B. Sistema al día (Sin actualizaciones pendientes) */}
      {isUpToDate && !isChecking && (
        <Card className="border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  ¡Su sistema SAD está totalmente actualizado!
                </h4>
                <Badge className="bg-emerald-600 text-white font-semibold">Al día</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Está ejecutando la versión más reciente (v{currentVersion}) con todos los parches de seguridad, optimización de base de datos y compatibilidad con Firma Perú vigentes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* C. Nueva versión disponible */}
      {isAvailable && updateInfo && (
        <Card className="border-2 border-indigo-500/80 dark:border-indigo-500/70 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">Nueva Versión Disponible</span>
                  <Badge className="bg-white text-indigo-700 font-bold px-2.5 py-0.5">
                    v{updateInfo.version}
                  </Badge>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Publicada el{' '}
                  {updateInfo.releaseDate
                    ? new Date(updateInfo.releaseDate).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'recientemente'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={downloadUpdate}
              className="bg-white hover:bg-slate-100 text-indigo-700 font-semibold shadow-sm gap-2"
            >
              <Download className="w-4 h-4" />
              {isDesktop ? 'Descargar e Instalar' : 'Descargar Instalador .EXE'}
            </Button>
          </div>

          <CardContent className="pt-6 space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>Novedades y Mejoras de esta Versión:</span>
              </h5>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 max-h-56 overflow-y-auto whitespace-pre-line leading-relaxed font-sans">
                {typeof updateInfo.releaseNotes === 'string'
                  ? updateInfo.releaseNotes
                  : 'Esta actualización incluye optimizaciones en el procesamiento de documentos, mejoras de rendimiento en el motor de firmas digitales y parches de estabilidad.'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>
                La actualización conserva intactos todos sus expedientes, documentos almacenados y la base de datos local.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* D. Descarga en curso con barra de progreso */}
      {isDownloading && (
        <Card className="border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Download className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Descargando actualización v{updateInfo?.version || ''}...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  El proceso se realiza en segundo plano. Puede continuar usando el sistema normalmente.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {progress?.percent || 0}%
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <Progress value={progress?.percent || 0} className="h-3" />
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>
                Transferido: {formatBytes(progress?.transferred || 0)} de{' '}
                {formatBytes(progress?.total || 0)}
              </span>
              <span>Velocidad: {formatSpeed(progress?.bytesPerSecond || 0)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* E. Actualización descargada, lista para instalar y reiniciar */}
      {isDownloaded && (
        <Card className="border-2 border-emerald-500 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    ¡Actualización Lista para Instalar!
                  </h4>
                  <Badge className="bg-emerald-600 text-white">Completada</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  El paquete oficial ha sido descargado y verificado. Al presionar el botón a continuación, el sistema detendrá de forma segura los servicios locales y se reiniciará automáticamente con la nueva versión instalada.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                type="button"
                onClick={installUpdate}
                className="w-full md:w-auto px-6 py-6 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg rounded-xl gap-2 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Reiniciar y Actualizar Ahora
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* F. Error durante comprobación o descarga */}
      {isError && (
        <Card className="border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                No se pudo completar la comprobación de actualizaciones
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {errorMessage}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={checkForUpdates}
                  className="gap-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar Búsqueda
                </Button>

                {manualDownloadUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(manualDownloadUrl, '_blank')}
                    className="gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Descarga manual en GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
