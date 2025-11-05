'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  HelpCircle, 
  Video, 
  FileText, 
  PlayCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { glossary, searchGlossary, getGlossaryByCategory } from '@/lib/glossary';
import { tours, getToursByModule } from '@/lib/tours';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface HelpCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    category: 'Documentos',
    questions: [
      {
        question: '¿Cómo cargo un documento al sistema?',
        answer: 'Ve a la sección "Archivo > Documentos" y haz clic en el botón "Nuevo Documento". Puedes cargar archivos PDF, Word o imágenes. El sistema procesará automáticamente OCR para hacer el contenido buscable.',
      },
      {
        question: '¿Qué es el OCR y para qué sirve?',
        answer: 'OCR (Reconocimiento Óptico de Caracteres) es una tecnología que convierte imágenes de texto en documentos escaneados a texto digital. Esto permite buscar contenido dentro de documentos escaneados y mejorar la accesibilidad.',
      },
      {
        question: '¿Puedo editar un documento después de cargarlo?',
        answer: 'Puedes actualizar los metadatos (título, tipología, oficina, etc.) pero no el archivo en sí. Si necesitas modificar el contenido, debes cargar una nueva versión del documento, que se guardará en el historial.',
      },
      {
        question: '¿Cómo funcionan las versiones de documentos?',
        answer: 'Cada vez que subes una nueva versión de un documento, el sistema crea un registro histórico. Puedes ver todas las versiones anteriores, descargarlas o restaurarlas si es necesario.',
      },
    ],
  },
  {
    category: 'Expedientes',
    questions: [
      {
        question: '¿Qué es un expediente?',
        answer: 'Un expediente es un conjunto organizado de documentos relacionados con un mismo asunto o trámite administrativo. Por ejemplo, un expediente de contratación contiene todos los documentos del proceso de contratación de un empleado.',
      },
      {
        question: '¿Cómo agrego documentos a un expediente?',
        answer: 'Abre el expediente y haz clic en "Agregar Documento". Puedes seleccionar documentos existentes o cargar nuevos. Cada documento recibe automáticamente un número de folio secuencial.',
      },
      {
        question: '¿Puedo mover un expediente a otro archivador?',
        answer: 'Sí, desde el detalle del expediente puedes cambiar el archivador destino. Esta acción queda registrada en la auditoría del sistema.',
      },
    ],
  },
  {
    category: 'Firma Digital',
    questions: [
      {
        question: '¿Qué necesito para firmar digitalmente?',
        answer: 'Necesitas un certificado digital válido emitido por RENIEC u otra entidad certificadora autorizada en Perú. El sistema se integra con Firma Perú para validar firmas digitales.',
      },
      {
        question: '¿Cómo funciona el flujo de firma?',
        answer: 'Puedes definir una secuencia de firmantes para cada documento. El sistema notifica automáticamente a cada persona cuando le toca firmar, siguiendo el orden establecido.',
      },
      {
        question: '¿Puedo revertir una firma?',
        answer: 'Las firmas digitales tienen validez legal y no deberían revertirse. Sin embargo, usuarios con permisos de administración pueden invalidar firmas en casos excepcionales, dejando registro en la auditoría.',
      },
    ],
  },
  {
    category: 'Búsqueda y Filtros',
    questions: [
      {
        question: '¿Cómo busco documentos específicos?',
        answer: 'Usa la barra de búsqueda global o los filtros avanzados en cada sección. Puedes buscar por título, contenido (gracias a OCR), tipología, fecha, oficina emisora y más.',
      },
      {
        question: '¿Los filtros se guardan?',
        answer: 'Los filtros se mantienen durante tu sesión actual. Si cierras el navegador, deberás aplicarlos nuevamente.',
      },
    ],
  },
  {
    category: 'Seguridad y Auditoría',
    questions: [
      {
        question: '¿Quién puede ver mis documentos?',
        answer: 'La visibilidad depende de los permisos asignados a tu rol y oficina. Por defecto, solo ves documentos de tu área. Usuarios con rol de administrador tienen acceso completo.',
      },
      {
        question: '¿Se registran todas las acciones?',
        answer: 'Sí, el sistema mantiene una auditoría completa de todas las operaciones: quién accedió, modificó o descargó documentos, con fecha y hora exactas.',
      },
    ],
  },
];

const resources = [
  {
    title: 'Manual de Usuario Completo',
    description: 'Guía detallada de todas las funcionalidades del sistema',
    type: 'document',
    icon: FileText,
    url: '#',
  },
  {
    title: 'Video: Introducción al SAD',
    description: 'Video tutorial de 10 minutos sobre funciones básicas',
    type: 'video',
    icon: Video,
    url: '#',
  },
  {
    title: 'Guía de Firma Digital',
    description: 'Cómo configurar y utilizar la firma electrónica',
    type: 'document',
    icon: FileText,
    url: '#',
  },
  {
    title: 'Video: Gestión de Expedientes',
    description: 'Tutorial paso a paso sobre expedientes',
    type: 'video',
    icon: Video,
    url: '#',
  },
];

// Mapeo de módulos de tours a módulos de permisos
const TOUR_PERMISSION_MAP: Record<string, string> = {
  'general': 'analytics',
  'archivadores': 'archivadores',
  'documentos': 'documents',
  'expedientes': 'expedientes',
  'firma': 'signing',
  'reportes': 'reports',
  'usuarios': 'users',
  'roles': 'roles',
};

export function HelpCenterDrawer({ isOpen, onClose }: HelpCenterDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faqs');
  const { startTour, resetTour, completedTours } = useOnboarding();
  const { hasModule } = usePermissions();

  // Mapeo de categorías de FAQ a módulos de permisos
  const faqPermissionMap: Record<string, string> = {
    'Documentos': 'documents',
    'Expedientes': 'expedientes',
    'Firma Digital': 'signing',
    'Búsqueda y Filtros': 'search',
    'Seguridad y Auditoría': 'audit',
  };

  const filteredFaqs = useMemo(() => {
    // Filtrar FAQs por permisos
    const allowedFaqs = faqs.filter(category => {
      const requiredModule = faqPermissionMap[category.category];
      // Si no hay módulo requerido, mostrar siempre (FAQ general)
      if (!requiredModule) return true;
      // Verificar si el usuario tiene el módulo
      return hasModule(requiredModule as any);
    });

    if (!searchQuery) return allowedFaqs;
    
    const query = searchQuery.toLowerCase();
    return allowedFaqs
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          q => 
            q.question.toLowerCase().includes(query) ||
            q.answer.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.questions.length > 0);
  }, [searchQuery, hasModule]);

  const filteredGlossary = useMemo(() => {
    if (!searchQuery) return Object.values(glossary);
    return searchGlossary(searchQuery);
  }, [searchQuery]);

  // Filtrar tours según permisos del usuario
  const filteredTours = useMemo(() => {
    return Object.values(tours)
      .filter((tour) => {
        // Excluir tours específicos que no queremos mostrar
        if (['reportes-documentos-tour', 'reportes-actividad-tour', 'reportes-firmas-tour'].includes(tour.id)) {
          return false;
        }
        
        // Obtener el módulo de permisos correspondiente
        const permissionModule = TOUR_PERMISSION_MAP[tour.module];
        
        // Si no hay mapeo, no mostrar el tour (por seguridad)
        if (!permissionModule) {
          console.warn(`Tour "${tour.id}" no tiene módulo de permisos mapeado`);
          return false;
        }
        
        // Verificar si el usuario tiene acceso al módulo
        return hasModule(permissionModule as any);
      });
  }, [hasModule]);

  const handleStartTour = (tourId: string) => {
    // Verificar permisos antes de iniciar el tour
    const tour = tours[tourId];
    if (!tour) {
      console.error(`[HelpCenter] Tour no encontrado: ${tourId}`);
      return;
    }

    const permissionModule = TOUR_PERMISSION_MAP[tour.module];
    if (permissionModule && !hasModule(permissionModule as any)) {
      console.warn(`[HelpCenter] Intento de acceso no autorizado al tour: ${tourId}`);
      return;
    }

    // Map tours to their required routes
    const tourRoutes: Record<string, string> = {
      'general-tour': '/dashboard',
      'archivadores-tour': '/dashboard/archivo/archivadores',
      'documentos-tour': '/dashboard/archivo/documentos',
      'expedientes-tour': '/dashboard/archivo/expedientes',
      'busqueda-tour': '/dashboard/consultas/busqueda',
      'firma-firmar-tour': '/dashboard/firma/firmar',
      'firma-flujos-tour': '/dashboard/firma/flujos',
      'firma-validar-tour': '/dashboard/firma/validar',
      'firma-analytics-tour': '/dashboard/firma/analytics',
      'reportes-intro-tour': '/dashboard/reportes',
      'reportes-documentos-tour': '/dashboard/reportes',
      'reportes-actividad-tour': '/dashboard/reportes',
      'reportes-firmas-tour': '/dashboard/reportes',
      'configuracion-tour': '/dashboard/configuracion',
    };
    
    const requiredRoute = tourRoutes[tourId];
    const currentPath = window.location.pathname;
    
    // If we're not on the correct route, navigate there first
    if (requiredRoute && currentPath !== requiredRoute) {
      console.log(`[HelpCenter] Redirecting to ${requiredRoute} for tour ${tourId}`);
      // Mark that we want to force-start this tour after redirect
      sessionStorage.setItem('force-tour-start', tourId);
      onClose();
      window.location.href = requiredRoute;
      return;
    }
    
    // We're on the correct page, start the tour
    resetTour(tourId);
    startTour(tourId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-950 shadow-2xl z-50",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-labelledby="help-center-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 id="help-center-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Centro de Ayuda
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar centro de ayuda"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4 bg-white dark:bg-gray-950">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              aria-label="Buscar en centro de ayuda"
            />
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white dark:bg-gray-950">
          <TabsList className="w-full px-6 justify-start bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
            <TabsTrigger value="faqs">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="glossary">
              <BookOpen className="h-4 w-4 mr-2" />
              Glosario
            </TabsTrigger>
            <TabsTrigger value="tours">
              <PlayCircle className="h-4 w-4 mr-2" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
          </TabsList>

          <div className="bg-white dark:bg-gray-950">
            <ScrollArea className="h-[calc(100vh-240px)]">
            <TabsContent value="faqs" className="p-6 pt-4 bg-white dark:bg-gray-950">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron preguntas frecuentes</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFaqs.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        {category.category}
                        <Badge variant="secondary" className="text-xs">
                          {category.questions.length}
                        </Badge>
                      </h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.questions.map((faq, qIdx) => (
                          <AccordionItem 
                            key={qIdx} 
                            value={`${idx}-${qIdx}`}
                            className="border rounded-lg px-4 bg-gray-50 dark:bg-gray-900/30"
                          >
                            <AccordionTrigger className="text-sm text-left text-gray-900 dark:text-gray-100 hover:no-underline">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      {idx < filteredFaqs.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="glossary" className="p-6 pt-4 bg-white dark:bg-gray-950">
              {filteredGlossary.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron términos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGlossary.map((term, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-900/30">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{term.term}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {term.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {term.definition}
                      </p>
                      {term.examples && term.examples.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
                          <span className="font-medium">Ejemplos: </span>
                          {term.examples.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tours" className="p-6 pt-4 bg-white dark:bg-gray-950">
              <div className="space-y-4">
                {filteredTours.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay tours disponibles para tus permisos</p>
                  </div>
                ) : (
                  filteredTours.map((tour) => {
                  const isCompleted = completedTours.includes(tour.id);
                  return (
                    <div key={tour.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900/30">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            {tour.name}
                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                Completado
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {tour.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">
                          {tour.module}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {tour.steps.length} pasos
                      </div>
                      <Button
                        onClick={() => handleStartTour(tour.id)}
                        variant={isCompleted ? 'outline' : 'default'}
                        size="sm"
                        className="w-full gap-2"
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            Ver nuevamente
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Iniciar tour
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="p-6 pt-4 bg-white dark:bg-gray-950">
              <div className="space-y-4">
                {resources.map((resource, idx) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-gray-50 dark:bg-gray-900/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            {resource.title}
                            <ExternalLink className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </>
  );
}
