'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Info, HelpCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchAssistBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function SearchAssistBanner({ onDismiss, showDismiss = true }: SearchAssistBannerProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="flex items-start justify-between flex-1">
          <div className="flex-1">
            <AlertTitle className="text-blue-900 dark:text-blue-100 mb-1">
              Consejos de búsqueda
            </AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
              Puedes buscar por número de documento, remitente, contenido OCR o anotaciones.
              Usa los filtros avanzados para refinar resultados.{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                onClick={() => setGuideOpen(true)}
              >
                Ver guía rápida
              </Button>
            </AlertDescription>
          </div>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>Guía Rápida de Búsqueda</span>
            </DialogTitle>
            <DialogDescription>
              Aprende a sacar el máximo provecho del sistema de búsqueda
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-6">
              {/* Búsqueda básica */}
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    1
                  </span>
                  <span>Búsqueda Básica</span>
                </h3>
                <div className="ml-8 space-y-2 text-sm text-slate-700">
                  <p>
                    Ingresa cualquier término en el campo principal para buscar en:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Números de documento</li>
                    <li>Remitentes</li>
                    <li>Contenido OCR (texto extraído de PDFs)</li>
                    <li>Anotaciones manuales</li>
                  </ul>
                </div>
              </section>

              {/* Filtros avanzados */}
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    2
                  </span>
                  <span>Filtros Avanzados</span>
                </h3>
                <div className="ml-8 space-y-2 text-sm text-slate-700">
                  <p>Refina tus resultados con filtros específicos:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Identificación:</strong> Número de documento, tipo, remitente</li>
                    <li><strong>Ubicación:</strong> Oficina, archivador, periodo, expediente</li>
                    <li><strong>Fechas:</strong> Rango de fechas personalizado</li>
                  </ul>
                </div>
              </section>

              {/* Búsquedas guardadas */}
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    3
                  </span>
                  <span>Búsquedas Guardadas</span>
                </h3>
                <div className="ml-8 space-y-2 text-sm text-slate-700">
                  <p>
                    Guarda tus búsquedas frecuentes para acceso rápido:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Realiza una búsqueda con filtros</li>
                    <li>Haz clic en "Guardar actual"</li>
                    <li>Dale un nombre descriptivo</li>
                    <li>Accede desde la barra de búsquedas guardadas</li>
                  </ul>
                </div>
              </section>

              {/* Filtros rápidos */}
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    4
                  </span>
                  <span>Filtros Rápidos</span>
                </h3>
                <div className="ml-8 space-y-2 text-sm text-slate-700">
                  <p>
                    Usa los presets preconfigurados para búsquedas comunes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Firmados esta semana:</strong> Documentos con firma reciente</li>
                    <li><strong>Pendientes de OCR:</strong> Documentos sin procesar</li>
                    <li><strong>Oficios recientes:</strong> Oficios del último mes</li>
                    <li><strong>Documentos del mes:</strong> Creados este mes</li>
                  </ul>
                </div>
              </section>

              {/* Atajos de teclado */}
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    5
                  </span>
                  <span>Atajos de Teclado</span>
                </h3>
                <div className="ml-8 space-y-2 text-sm text-slate-700">
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><kbd className="px-2 py-1 bg-slate-100 rounded border">?</kbd> - Abrir esta guía</li>
                    <li><kbd className="px-2 py-1 bg-slate-100 rounded border">Enter</kbd> - Realizar búsqueda</li>
                    <li><kbd className="px-2 py-1 bg-slate-100 rounded border">Esc</kbd> - Limpiar campo</li>
                  </ul>
                </div>
              </section>

              {/* Consejos adicionales */}
              <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">💡 Consejos adicionales</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Usa términos específicos para mejores resultados</li>
                  <li>• Combina búsqueda de texto con filtros para precisión</li>
                  <li>• Revisa el historial de búsquedas recientes</li>
                  <li>• Los resultados destacan las coincidencias encontradas</li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
