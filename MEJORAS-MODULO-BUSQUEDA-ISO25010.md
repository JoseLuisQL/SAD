# Mejoras del Módulo de Búsqueda - ISO 25010 (Usabilidad)

## 1. Análisis del Estado Actual

### 1.1 Componentes Identificados

| Componente | Archivo | Función |
|------------|---------|---------|
| SearchPage | `app/dashboard/consultas/busqueda/page.tsx` | Página principal de búsqueda |
| AdvancedSearchFilters | `components/search/AdvancedSearchFilters.tsx` | Panel de filtros avanzados |
| SearchResultsTable | `components/search/SearchResultsTable.tsx` | Tabla de resultados |
| QuickPreviewModal | `components/search/QuickPreviewModal.tsx` | Modal de vista previa |
| SearchSummary | `components/search/SearchSummary.tsx` | Resumen de búsqueda |
| QuickPresetsBar | `components/search/QuickPresetsBar.tsx` | Barra de filtros rápidos |
| SearchAssistBanner | `components/search/SearchAssistBanner.tsx` | Banner de ayuda |
| RecentQueriesDropdown | `components/search/RecentQueriesDropdown.tsx` | Dropdown de consultas recientes |
| SavedSearchBar | `components/search/SavedSearchBar.tsx` | Barra de búsquedas guardadas |
| GlobalSearchCommand | `components/search/GlobalSearchCommand.tsx` | Búsqueda global (Ctrl+K) |

### 1.2 Funcionalidades Actuales

- Búsqueda por texto completo (OCR, anotaciones, metadatos)
- Filtros avanzados (9 criterios)
- Filtros rápidos predefinidos (5 presets)
- Búsquedas guardadas personalizadas
- Historial de consultas recientes
- Vista previa rápida de documentos
- Ordenamiento por columnas
- Paginación de resultados
- Resaltado de coincidencias
- Timeline de actividad del documento

### 1.3 Problemas de Usabilidad Detectados

1. **Sobrecarga visual**: Demasiados elementos visibles simultáneamente
2. **Jerarquía confusa**: No hay clara priorización de acciones
3. **Filtros ocultos**: El panel de filtros avanzados está colapsado por defecto
4. **Falta de feedback visual**: Estados de carga inconsistentes
5. **Complejidad innecesaria**: Múltiples formas de hacer lo mismo sin guía clara
6. **Contraste insuficiente**: Algunos textos tienen poco contraste en modo claro/oscuro
7. **Acciones no evidentes**: Botones de acción pequeños y poco visibles

---

## 2. ISO 25010 - Criterios de Usabilidad

La norma ISO 25010 define las siguientes subcaracterísticas de usabilidad:

| Subcaracterística | Descripción |
|-------------------|-------------|
| **Reconocibilidad de la adecuación** | El usuario puede reconocer si el producto es apropiado para sus necesidades |
| **Capacidad de aprendizaje** | El usuario puede aprender a usar el sistema con facilidad |
| **Operabilidad** | El sistema es fácil de operar y controlar |
| **Protección contra errores** | El sistema previene errores del usuario |
| **Estética de interfaz** | La interfaz es agradable y satisfactoria |
| **Accesibilidad** | El sistema es usable por personas con diversas capacidades |

---

## 3. Mejoras Propuestas

### 3.1 Reconocibilidad de la Adecuación

#### M1. Simplificar la interfaz inicial
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

**Estado actual**: Múltiples secciones visibles (banner de ayuda, presets, barra de búsqueda, resultados vacíos)

**Mejora propuesta**:
```tsx
// ANTES: Demasiados elementos visibles
<SearchAssistBanner />
<QuickPresetsBar />
<Card className="p-6">...</Card>

// DESPUÉS: Interfaz limpia y enfocada
<Card className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
  <div className="max-w-2xl mx-auto text-center space-y-6">
    {/* Título claro y conciso */}
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        Buscar Documentos
      </h1>
      <p className="text-slate-500 dark:text-slate-400">
        Encuentra documentos por número, remitente o contenido
      </p>
    </div>
    
    {/* Barra de búsqueda prominente y centrada */}
    <form onSubmit={handleSearchSubmit} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <Input
        type="text"
        placeholder="Escribe para buscar..."
        className="h-14 pl-12 pr-4 text-lg rounded-xl border-slate-200 dark:border-slate-700 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button 
        type="submit" 
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-lg"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
      </Button>
    </form>
    
    {/* Acciones secundarias minimalistas */}
    <div className="flex items-center justify-center gap-4 text-sm">
      <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)}>
        <Filter className="h-4 w-4 mr-2" />
        Filtros avanzados
      </Button>
      <span className="text-slate-300 dark:text-slate-700">|</span>
      <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
        <HelpCircle className="h-4 w-4 mr-2" />
        Ayuda
      </Button>
    </div>
  </div>
</Card>
```

#### M2. Mostrar estados claros del sistema
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

**Mejora propuesta**: Crear 4 estados visuales distintos
```tsx
// Estado 1: Inicial (sin búsqueda)
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 
                    flex items-center justify-center">
      <Search className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
      ¿Qué documento buscas?
    </h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
      Puedes buscar por número, remitente, contenido o aplicar filtros específicos
    </p>
  </div>
);

// Estado 2: Cargando
const LoadingState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 
                    flex items-center justify-center animate-pulse">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
      Buscando documentos...
    </h3>
    <p className="text-slate-500 dark:text-slate-400">
      Esto tomará solo un momento
    </p>
  </div>
);

// Estado 3: Sin resultados
const NoResultsState = ({ query }: { query: string }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 
                    flex items-center justify-center">
      <SearchX className="w-8 h-8 text-amber-600" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
      No encontramos resultados
    </h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
      No hay documentos que coincidan con "{query}"
    </p>
    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
      <p className="font-medium">Sugerencias:</p>
      <ul className="space-y-1">
        <li>• Verifica la ortografía del término</li>
        <li>• Usa palabras más generales</li>
        <li>• Reduce el número de filtros</li>
      </ul>
    </div>
  </div>
);

// Estado 4: Con resultados (tabla actual mejorada)
```

---

### 3.2 Capacidad de Aprendizaje

#### M3. Onboarding progresivo
**Archivo**: `components/search/SearchOnboarding.tsx` (crear nuevo)

**Mejora propuesta**: Tour guiado simplificado
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
  {
    target: '[data-tour="search-input"]',
    title: '1. Barra de búsqueda',
    description: 'Escribe cualquier término para buscar en documentos, números, remitentes o contenido OCR.',
    position: 'bottom',
  },
  {
    target: '[data-tour="search-filters-button"]',
    title: '2. Filtros avanzados',
    description: 'Refina tu búsqueda por tipo de documento, fecha, oficina y más.',
    position: 'bottom',
  },
  {
    target: '[data-tour="search-results-table"]',
    title: '3. Resultados',
    description: 'Los resultados muestran coincidencias resaltadas. Haz clic en cualquier documento para verlo.',
    position: 'top',
  },
];

export default function SearchOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('search-onboarding-completed');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('search-onboarding-completed', 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Tooltip del paso actual */}
      <div 
        className="absolute bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm
                   border border-slate-200 dark:border-slate-700"
        style={{ /* Posicionar dinámicamente según el target */ }}
      >
        <button 
          onClick={handleComplete}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
          {step.title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {step.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Entendido'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### M4. Tooltips contextuales
**Archivo**: Aplicar en todos los componentes

**Mejora propuesta**: Usar tooltips con descripciones claras
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Ejemplo en el botón de filtros
<TooltipProvider>
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
        <Filter className="h-4 w-4 mr-2" />
        Filtros
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
        )}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="max-w-xs">
      <p className="font-medium">Filtros avanzados</p>
      <p className="text-xs text-slate-400">
        Refina por tipo, fecha, oficina, archivador y más
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 3.3 Operabilidad

#### M5. Simplificar filtros avanzados
**Archivo**: `components/search/AdvancedSearchFilters.tsx`

**Estado actual**: 9 campos en 3 secciones, excesivamente complejo

**Mejora propuesta**: Filtros colapsables y priorizados
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterSection {
  id: string;
  title: string;
  description: string;
  isOpen: boolean;
}

export default function AdvancedSearchFiltersSimplified({
  onApply,
  onClear,
  defaultValues,
  loading,
}: AdvancedSearchFiltersProps) {
  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'basic', title: 'Filtros básicos', description: 'Número, tipo y remitente', isOpen: true },
    { id: 'location', title: 'Ubicación', description: 'Oficina y archivador', isOpen: false },
    { id: 'dates', title: 'Fechas', description: 'Rango de fechas', isOpen: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: defaultValues || {},
  });

  const activeCount = Object.values(watch()).filter(v => v).length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header con contador y botón limpiar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-slate-900 dark:text-white">
            Filtros avanzados
          </h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {activeCount} activos
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { reset({}); onClear(); }}
            className="text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Secciones colapsables */}
      <form onSubmit={handleSubmit(onApply)} className="divide-y divide-slate-200 dark:divide-slate-800">
        {sections.map((section) => (
          <Collapsible
            key={section.id}
            open={section.isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
              <div className="text-left">
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {section.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {section.description}
                </p>
              </div>
              {section.isOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-4 pb-4">
              {section.id === 'basic' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Número de documento
                    </Label>
                    <Input
                      placeholder="Ej: 001-2025"
                      className="h-9"
                      {...register('documentNumber')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Tipo de documento
                    </Label>
                    <Select
                      value={watch('documentTypeId') || ''}
                      onValueChange={(v) => setValue('documentTypeId', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Options... */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Remitente
                    </Label>
                    <Input
                      placeholder="Nombre o institución"
                      className="h-9"
                      {...register('sender')}
                    />
                  </div>
                </div>
              )}
              
              {section.id === 'location' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Oficina
                    </Label>
                    <Select
                      value={watch('officeId') || ''}
                      onValueChange={(v) => setValue('officeId', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todas las oficinas" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Options... */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Archivador
                    </Label>
                    <Select
                      value={watch('archivadorId') || ''}
                      onValueChange={(v) => setValue('archivadorId', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todos los archivadores" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Options... */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {section.id === 'dates' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Desde
                    </Label>
                    <Input type="date" className="h-9" {...register('dateFrom')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 dark:text-slate-400">
                      Hasta
                    </Label>
                    <Input type="date" className="h-9" {...register('dateTo')} />
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {/* Botón de aplicar */}
        <div className="p-4 bg-white dark:bg-slate-900">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Aplicando...' : 'Aplicar filtros'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### M6. Mejorar tabla de resultados
**Archivo**: `components/search/SearchResultsTable.tsx`

**Mejora propuesta**: Diseño más limpio y acciones claras
```tsx
// Reemplazar el menú dropdown por acciones visibles
<TableCell className="text-right">
  <div className="flex items-center justify-end gap-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onView?.(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Vista rápida</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
            onClick={() => onDownload?.(document)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Descargar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    
    {document.expediente && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={() => onViewExpediente?.(document.expediente!.id)}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver expediente</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
</TableCell>
```

#### M7. Reducir columnas de la tabla
**Archivo**: `components/search/SearchResultsTable.tsx`

**Estado actual**: 9 columnas (demasiadas para pantallas pequeñas)

**Mejora propuesta**: 5 columnas principales + información secundaria en hover
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-slate-200 dark:border-slate-700">
      <TableHead className="w-[180px]">Documento</TableHead>
      <TableHead className="w-[120px]">Fecha</TableHead>
      <TableHead>Remitente</TableHead>
      <TableHead className="w-[100px]">Estado</TableHead>
      <TableHead className="w-[120px] text-right">Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map((document) => (
      <TableRow 
        key={document.id}
        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        onClick={() => onView?.(document)}
      >
        {/* Columna combinada: Número + Tipo */}
        <TableCell>
          <div className="space-y-1">
            <p className="font-medium text-slate-900 dark:text-white">
              <HighlightedText 
                text={document.documentNumber}
                terms={document.searchMetadata?.matchedTerms}
              />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {document.documentType.name}
            </p>
          </div>
        </TableCell>
        
        {/* Fecha */}
        <TableCell className="text-slate-600 dark:text-slate-300">
          {format(new Date(document.documentDate), 'dd/MM/yyyy')}
        </TableCell>
        
        {/* Remitente + Oficina en línea secundaria */}
        <TableCell>
          <div className="space-y-1">
            <p className="text-slate-900 dark:text-white truncate max-w-[250px]">
              <HighlightedText 
                text={document.sender}
                terms={document.searchMetadata?.matchedTerms}
              />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {document.office.name}
            </p>
          </div>
        </TableCell>
        
        {/* Estado OCR con badge minimalista */}
        <TableCell>
          <OCRStatusBadgeMinimal status={document.ocrStatus} />
        </TableCell>
        
        {/* Acciones visibles en hover */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* ... botones de acción */}
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 3.4 Protección Contra Errores del Usuario

#### M8. Validación en tiempo real
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

**Mejora propuesta**: Feedback inmediato al escribir
```tsx
// Indicar si la búsqueda es muy corta
const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

useEffect(() => {
  if (query.length > 0 && query.length < 2) {
    setSearchFeedback('Escribe al menos 2 caracteres para buscar');
  } else {
    setSearchFeedback(null);
  }
}, [query]);

// En el JSX
<div className="relative">
  <Input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className={searchFeedback ? 'border-amber-400 focus:ring-amber-400' : ''}
  />
  {searchFeedback && (
    <p className="absolute -bottom-5 left-0 text-xs text-amber-600">
      {searchFeedback}
    </p>
  )}
</div>
```

#### M9. Confirmación antes de limpiar filtros
**Archivo**: `components/search/AdvancedSearchFilters.tsx`

**Mejora propuesta**: Diálogo de confirmación
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Solo mostrar confirmación si hay muchos filtros activos
{activeCount >= 3 ? (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="sm">
        <RotateCcw className="h-4 w-4 mr-1" />
        Limpiar todo
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Limpiar todos los filtros?</AlertDialogTitle>
        <AlertDialogDescription>
          Tienes {activeCount} filtros activos. Esta acción los eliminará todos.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={handleClear}>
          Sí, limpiar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
) : (
  <Button variant="ghost" size="sm" onClick={handleClear}>
    <RotateCcw className="h-4 w-4 mr-1" />
    Limpiar
  </Button>
)}
```

#### M10. Estado de búsqueda persistente
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

**Mejora propuesta**: Guardar búsqueda en URL y sessionStorage
```tsx
// Ya existe parcialmente - mejorar sincronización
useEffect(() => {
  // Guardar estado en sessionStorage para recuperar si se navega y vuelve
  if (query || Object.keys(filters).length > 0) {
    sessionStorage.setItem('lastSearch', JSON.stringify({ query, filters }));
  }
}, [query, filters]);

// Recuperar al montar
useEffect(() => {
  const lastSearch = sessionStorage.getItem('lastSearch');
  if (lastSearch && !searchParams.get('query')) {
    const { query: savedQuery, filters: savedFilters } = JSON.parse(lastSearch);
    setQuery(savedQuery);
    setFilters(savedFilters);
  }
}, []);
```

---

### 3.5 Estética de la Interfaz de Usuario

#### M11. Sistema de espaciado consistente
**Aplicar en todos los componentes**

**Mejora propuesta**: Usar escala de espaciado de 4px
```css
/* Escala de espaciado recomendada */
.spacing-scale {
  --space-1: 4px;   /* gap-1 */
  --space-2: 8px;   /* gap-2 */
  --space-3: 12px;  /* gap-3 */
  --space-4: 16px;  /* gap-4 */
  --space-5: 20px;  /* gap-5 */
  --space-6: 24px;  /* gap-6 */
  --space-8: 32px;  /* gap-8 */
  --space-10: 40px; /* gap-10 */
  --space-12: 48px; /* gap-12 */
}

/* Aplicar consistentemente */
.section-gap { @apply space-y-6; }
.card-padding { @apply p-6; }
.form-gap { @apply space-y-4; }
.button-gap { @apply gap-2; }
```

#### M12. Tipografía jerárquica
**Aplicar en todos los componentes**

**Mejora propuesta**:
```css
/* Jerarquía tipográfica */
.heading-1 { @apply text-2xl font-semibold text-slate-900 dark:text-white; }
.heading-2 { @apply text-xl font-semibold text-slate-900 dark:text-white; }
.heading-3 { @apply text-lg font-medium text-slate-900 dark:text-white; }
.heading-4 { @apply text-base font-medium text-slate-800 dark:text-slate-100; }

.body-text { @apply text-sm text-slate-600 dark:text-slate-300; }
.body-small { @apply text-xs text-slate-500 dark:text-slate-400; }

.label { @apply text-sm font-medium text-slate-700 dark:text-slate-300; }
.caption { @apply text-xs text-slate-500 dark:text-slate-400; }
```

#### M13. Bordes y sombras sutiles
**Aplicar en todos los componentes**

**Mejora propuesta**:
```tsx
// Cards con sombra sutil y bordes definidos
<Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm 
                border border-slate-200 dark:border-slate-800
                hover:shadow-md transition-shadow">

// Separadores sutiles
<div className="border-t border-slate-100 dark:border-slate-800" />

// Inputs con estados claros
<Input className="border-slate-200 dark:border-slate-700 
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
```

---

## 4. Sistema de Colores y Contraste (WCAG AA)

### 4.1 Paleta de Colores Principal

```tsx
// tailwind.config.ts - Colores personalizados con contraste optimizado
const colors = {
  // Primario (Azul) - Ratio mínimo 4.5:1 sobre blanco
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Principal
    600: '#2563eb',  // Hover
    700: '#1d4ed8',  // Active
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral (Slate) - Para textos y fondos
  slate: {
    50: '#f8fafc',   // Fondo claro
    100: '#f1f5f9',  // Fondo secundario
    200: '#e2e8f0',  // Bordes claros
    300: '#cbd5e1',  // Bordes
    400: '#94a3b8',  // Texto secundario claro
    500: '#64748b',  // Texto secundario
    600: '#475569',  // Texto body
    700: '#334155',  // Texto importante
    800: '#1e293b',  // Fondo oscuro
    900: '#0f172a',  // Fondo más oscuro
    950: '#020617',  // Máximo contraste
  },
  
  // Estados semánticos
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
};
```

### 4.2 Contrastes de Texto

| Uso | Modo Claro | Modo Oscuro | Ratio |
|-----|------------|-------------|-------|
| Título principal | `slate-900` (#0f172a) | `white` (#ffffff) | 16.1:1 / 21:1 |
| Título secundario | `slate-800` (#1e293b) | `slate-100` (#f1f5f9) | 12.6:1 / 15.4:1 |
| Texto body | `slate-600` (#475569) | `slate-300` (#cbd5e1) | 5.9:1 / 8.5:1 |
| Texto secundario | `slate-500` (#64748b) | `slate-400` (#94a3b8) | 4.6:1 / 5.4:1 |
| Placeholder | `slate-400` (#94a3b8) | `slate-500` (#64748b) | 3.5:1 / 4.6:1 |

### 4.3 Componentes con Contraste Corregido

#### Botón Primario
```tsx
// ANTES (contraste insuficiente)
<Button className="bg-blue-500 text-white">

// DESPUÉS (contraste optimizado)
<Button className="bg-blue-600 text-white hover:bg-blue-700 
                  dark:bg-blue-500 dark:hover:bg-blue-600
                  focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2">
```

#### Input con estados
```tsx
<Input className="
  /* Base */
  bg-white dark:bg-slate-900 
  border-slate-300 dark:border-slate-600
  text-slate-900 dark:text-white
  
  /* Placeholder */
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  
  /* Focus */
  focus:border-blue-500 dark:focus:border-blue-400
  focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
  
  /* Disabled */
  disabled:bg-slate-100 dark:disabled:bg-slate-800
  disabled:text-slate-400 dark:disabled:text-slate-500
"/>
```

#### Badges de estado OCR
```tsx
const OCRStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variants[status]}`}>
      {status === 'pending' && 'Pendiente'}
      {status === 'processing' && 'Procesando'}
      {status === 'completed' && 'Completado'}
      {status === 'error' && 'Error'}
    </span>
  );
};
```

### 4.4 Tabla de Resultados con Contraste

```tsx
<Table>
  <TableHeader>
    <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">
        Documento
      </TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map((doc, idx) => (
      <TableRow 
        key={doc.id}
        className={`
          border-b border-slate-100 dark:border-slate-800
          ${idx % 2 === 0 
            ? 'bg-white dark:bg-slate-900' 
            : 'bg-slate-50/50 dark:bg-slate-800/30'
          }
          hover:bg-blue-50/50 dark:hover:bg-blue-900/20
          transition-colors
        `}
      >
        <TableCell className="text-slate-900 dark:text-white font-medium">
          {doc.documentNumber}
        </TableCell>
        <TableCell className="text-slate-600 dark:text-slate-300">
          {format(new Date(doc.documentDate), 'dd/MM/yyyy')}
        </TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 5. Accesibilidad

### M14. Atributos ARIA completos
**Aplicar en todos los componentes interactivos**

```tsx
// Barra de búsqueda
<div role="search" aria-label="Búsqueda de documentos">
  <label htmlFor="search-input" className="sr-only">
    Buscar documentos
  </label>
  <Input
    id="search-input"
    type="search"
    aria-describedby="search-help"
    aria-autocomplete="list"
    aria-expanded={showRecentQueries}
    aria-controls="recent-queries-list"
  />
  <p id="search-help" className="sr-only">
    Escribe para buscar por número de documento, remitente o contenido
  </p>
</div>

// Lista de consultas recientes
<ul 
  id="recent-queries-list"
  role="listbox"
  aria-label="Búsquedas recientes"
>
  {recentQueries.map((query, index) => (
    <li 
      key={index}
      role="option"
      aria-selected={selectedIndex === index}
    >
      {query}
    </li>
  ))}
</ul>

// Tabla de resultados
<Table role="grid" aria-label="Resultados de búsqueda">
  <TableHeader>
    <TableRow role="row">
      <TableHead role="columnheader" scope="col">
        Documento
      </TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map((doc) => (
      <TableRow 
        key={doc.id} 
        role="row"
        tabIndex={0}
        aria-label={`Documento ${doc.documentNumber}, ${doc.sender}`}
      >
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### M15. Navegación por teclado mejorada
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // / para enfocar búsqueda
    if (e.key === '/' && !isInputFocused()) {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }
    
    // Escape para limpiar búsqueda
    if (e.key === 'Escape') {
      if (showFilters) {
        setShowFilters(false);
      } else if (query) {
        setQuery('');
      }
    }
    
    // F para abrir filtros
    if (e.key === 'f' && e.ctrlKey) {
      e.preventDefault();
      setShowFilters(!showFilters);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [showFilters, query]);
```

### M16. Skip links
**Archivo**: `app/dashboard/consultas/busqueda/page.tsx`

```tsx
// Al inicio del componente
<a 
  href="#search-results" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
>
  Saltar a resultados
</a>

// En la tabla de resultados
<div id="search-results" tabIndex={-1}>
  <SearchResultsTable ... />
</div>
```

---

## 6. Resumen de Prioridades

### Alta Prioridad (Implementar primero)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| M1 | Simplificar interfaz inicial | Alto | Medio |
| M2 | Estados claros del sistema | Alto | Bajo |
| M6 | Mejorar tabla de resultados | Alto | Medio |
| M11 | Sistema de espaciado consistente | Alto | Bajo |
| 4.2 | Corrección de contrastes | Alto | Bajo |

### Media Prioridad

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| M5 | Simplificar filtros avanzados | Medio | Alto |
| M7 | Reducir columnas de tabla | Medio | Medio |
| M14 | Atributos ARIA | Medio | Medio |
| M15 | Navegación por teclado | Medio | Bajo |

### Baja Prioridad (Mejoras incrementales)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| M3 | Onboarding progresivo | Bajo | Alto |
| M4 | Tooltips contextuales | Bajo | Bajo |
| M8 | Validación en tiempo real | Bajo | Bajo |
| M9 | Confirmación antes de limpiar | Bajo | Bajo |
| M10 | Estado persistente | Bajo | Medio |

---

## 7. Checklist de Implementación

### Fase 1: Fundamentos (1-2 días)
- [ ] Aplicar correcciones de contraste en todos los componentes
- [ ] Implementar sistema de espaciado consistente
- [ ] Crear estados visuales claros (Empty, Loading, NoResults, Results)
- [ ] Simplificar header de la página

### Fase 2: Componentes Core (2-3 días)
- [ ] Rediseñar tabla de resultados (menos columnas, acciones visibles)
- [ ] Simplificar panel de filtros avanzados
- [ ] Mejorar modal de vista previa

### Fase 3: Interacción (1-2 días)
- [ ] Agregar tooltips contextuales
- [ ] Mejorar navegación por teclado
- [ ] Implementar skip links y atributos ARIA

### Fase 4: Polish (1 día)
- [ ] Animaciones y transiciones sutiles
- [ ] Revisión final de consistencia visual
- [ ] Testing de accesibilidad con herramientas automatizadas

---

## 8. Herramientas de Validación Recomendadas

1. **Contraste**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. **Accesibilidad**: axe DevTools, Lighthouse
3. **Usabilidad**: Testing con usuarios reales (5 usuarios mínimo)
4. **Responsive**: Chrome DevTools, Responsively App

---

*Documento generado para el Sistema Integrado de Archivos Digitales (SAD)*
*Fecha: 2025-12-19*
*Basado en ISO/IEC 25010:2011 - Calidad del software*
