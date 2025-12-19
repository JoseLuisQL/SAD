'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, ChevronUp, X, HelpCircle, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AdvancedSearchFilters from '@/components/search/AdvancedSearchFilters';
import SearchResultsTable from '@/components/search/SearchResultsTable';
import QuickPreviewModal from '@/components/search/QuickPreviewModal';
import SearchSummary from '@/components/search/SearchSummary';
import QuickPresetsBar from '@/components/search/QuickPresetsBar';
import SearchAssistBanner from '@/components/search/SearchAssistBanner';
import RecentQueriesDropdown from '@/components/search/RecentQueriesDropdown';
import { EmptyState, LoadingState, NoResultsState } from '@/components/search/SearchStates';
import { useSearch } from '@/hooks/useSearch';
import { useDocuments } from '@/hooks/useDocuments';
import { useSearchPreferences } from '@/store/searchPreferences.store';
import { useOnboarding } from '@/hooks/useOnboarding';
import { SearchFilters, SearchResultDocument } from '@/types/search.types';
import { toast } from 'sonner';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SearchResultDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchSource, setSearchSource] = useState<'manual' | 'saved' | 'preset'>('manual');
  const [showRecentQueries, setShowRecentQueries] = useState(false);
  const [showAssistBanner, setShowAssistBanner] = useState(true);
  const [appliedSearchName, setAppliedSearchName] = useState<string | null>(null);
  
  const { 
    results, 
    loading, 
    pagination, 
    searchDocuments 
  } = useSearch();
  
  const { downloadDocument } = useDocuments();
  const { addRecentQuery } = useSearchPreferences();
  const { startTour, resetTour } = useOnboarding();

  useEffect(() => {
    const initialQuery = searchParams.get('query') || '';
    const initialFilters: SearchFilters = {};
    const page = parseInt(searchParams.get('page') || '1');

    searchParams.forEach((value, key) => {
      if (key !== 'query' && key !== 'page' && key !== 'limit' && key !== 'source') {
        initialFilters[key as keyof SearchFilters] = value;
      }
    });

    setQuery(initialQuery);
    setFilters(initialFilters);

    if (initialQuery || Object.keys(initialFilters).length > 0) {
      searchDocuments(
        initialQuery,
        initialFilters,
        { page, limit: 10 },
        { sortField: 'documentDate', sortOrder: 'desc' },
        'manual'
      );
    }
  }, [searchParams]);

  // M15: Navegación por teclado mejorada
  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    return activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? para mostrar ayuda
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isInputFocused()) {
          e.preventDefault();
          setShowAssistBanner(true);
        }
      }
      
      // / para enfocar búsqueda
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isInputFocused()) {
          e.preventDefault();
          document.getElementById('search-input')?.focus();
        }
      }
      
      // Escape para cerrar elementos
      if (e.key === 'Escape') {
        if (showRecentQueries) {
          setShowRecentQueries(false);
        } else if (showFilters) {
          setShowFilters(false);
        } else if (query) {
          setQuery('');
        }
      }
      
      // Ctrl+F para abrir/cerrar filtros
      if (e.key === 'f' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showRecentQueries, showFilters, query, isInputFocused]);

  const performSearch = async (
    searchQuery: string,
    searchFilters: SearchFilters = {},
    page: number = 1,
    source: 'manual' | 'saved' | 'preset' = 'manual',
    searchName?: string
  ) => {
    // Add to recent queries only on manual searches
    if (source === 'manual' && searchQuery.trim() && page === 1) {
      addRecentQuery(searchQuery);
    }

    setSearchSource(source);
    setAppliedSearchName(searchName || null);

    const result = await searchDocuments(
      searchQuery,
      searchFilters,
      { page, limit: 10 },
      { sortField: 'documentDate', sortOrder: 'desc' },
      source
    );

    if (result) {
      updateUrl(searchQuery, searchFilters, page, source);
    }
  };

  const updateUrl = (
    searchQuery: string,
    searchFilters: SearchFilters,
    page: number,
    source?: 'manual' | 'saved' | 'preset'
  ) => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    if (page > 1) {
      params.set('page', page.toString());
    }

    if (source && source !== 'manual') {
      params.set('source', source);
    }

    const queryString = params.toString();
    router.push(`/dashboard/consultas/busqueda${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecentQueries(false);
    performSearch(query, filters, 1, 'manual');
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(query, newFilters, 1, 'manual');
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedSearchName(null);
    performSearch(query, {}, 1, 'manual');
  };

  const handlePageChange = (page: number) => {
    performSearch(query, filters, page, searchSource, appliedSearchName || undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPreset = (presetQuery: string, presetFilters: SearchFilters, presetId: string) => {
    setQuery(presetQuery);
    setFilters(presetFilters);
    performSearch(presetQuery, presetFilters, 1, 'preset', presetId);
  };

  const handleRecentQuerySelect = (recentQuery: string) => {
    setQuery(recentQuery);
    setShowRecentQueries(false);
  };

  const handleViewDocument = (document: SearchResultDocument) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  const handleDownloadDocument = async (document: SearchResultDocument) => {
    try {
      await downloadDocument(document.id, document.fileName);
    } catch (error) {
      console.error('Error al descargar:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const handleViewExpediente = (expedienteId: string) => {
    router.push(`/dashboard/archivo/expedientes/${expedienteId}`);
  };

  const handleStartTour = async () => {
    // Si no hay resultados de búsqueda, realizar una búsqueda de ejemplo
    if (results.length === 0 && !query && activeFiltersCount === 0) {
      toast.info('Realizando una búsqueda de ejemplo para mostrar todas las funcionalidades...');
      // Realizar búsqueda vacía para mostrar documentos recientes
      await performSearch('', {}, 1, 'manual');
      // Esperar a que se rendericen los resultados
      setTimeout(() => {
        resetTour('busqueda-tour');
        startTour('busqueda-tour');
      }, 800);
    } else {
      resetTour('busqueda-tour');
      // Give DOM time to settle
      setTimeout(() => {
        startTour('busqueda-tour');
      }, 100);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  const hasSearched = query || activeFiltersCount > 0;
  const showResults = hasSearched && !loading && results.length > 0;
  const showNoResults = hasSearched && !loading && results.length === 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* M16: Skip link para accesibilidad */}
      <a 
        href="#search-results" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Saltar a resultados
      </a>

      {/* Header simplificado con mejor contraste */}
      <div className="flex items-center justify-between" data-tour="search-header">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Buscar Documentos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Encuentra documentos por número, remitente o contenido
          </p>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTour}
                className="gap-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tour</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Inicia un tour guiado de la búsqueda</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Banner de ayuda contextual */}
      {showAssistBanner && (
        <SearchAssistBanner 
          onDismiss={() => setShowAssistBanner(false)} 
          showDismiss={true}
        />
      )}

      {/* Presets rápidos */}
      <QuickPresetsBar onApplyPreset={handleApplyPreset} />

      {/* Card de búsqueda principal con mejor contraste */}
      <Card className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          {/* Badge de búsqueda aplicada */}
          {appliedSearchName && searchSource !== 'manual' && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {searchSource === 'saved' ? 'Búsqueda Guardada' : 'Filtro Rápido'}: {appliedSearchName}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAppliedSearchName(null);
                  setSearchSource('manual');
                }}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Quitar búsqueda aplicada"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* M14: Formulario de búsqueda con ARIA completo */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex flex-col sm:flex-row gap-3"
            role="search"
            aria-label="Búsqueda de documentos"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <Input
                id="search-input"
                type="search"
                placeholder="Buscar en documentos, anotaciones, OCR..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowRecentQueries(true)}
                className="pl-10 h-12 text-base border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 
                           text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                aria-label="Campo de búsqueda de documentos"
                aria-describedby="search-help"
                aria-autocomplete="list"
                aria-expanded={showRecentQueries}
                aria-controls="recent-queries-list"
                data-tour="search-input"
              />
              <span id="search-help" className="sr-only">
                Escribe para buscar por número de documento, remitente o contenido. Presiona / para enfocar.
              </span>
              <RecentQueriesDropdown
                isVisible={showRecentQueries}
                onSelectQuery={handleRecentQuerySelect}
                onClose={() => setShowRecentQueries(false)}
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white
                         focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </>
              )}
            </Button>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700
                               focus:ring-2 focus:ring-slate-500/20"
                    data-tour="search-filters-button"
                    aria-expanded={showFilters}
                    aria-controls="advanced-filters-panel"
                  >
                    {showFilters ? (
                      <>
                        <ChevronUp className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Ocultar</span> Filtros
                      </>
                    ) : (
                      <>
                        <Filter className="h-5 w-5 mr-2" />
                        Filtros
                        {activeFiltersCount > 0 && (
                          <Badge className="ml-2 bg-blue-600 dark:bg-blue-500 text-white text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Filtros avanzados</p>
                  <p className="text-xs text-slate-400">Ctrl+F para abrir/cerrar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>

          {/* Panel de filtros avanzados */}
          {showFilters && (
            <div 
              id="advanced-filters-panel"
              className="pt-4 border-t border-slate-200 dark:border-slate-700"
              role="region"
              aria-label="Filtros avanzados de búsqueda"
            >
              <AdvancedSearchFilters
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                defaultValues={filters}
                loading={loading}
              />
            </div>
          )}
        </div>
      </Card>

      {/* M2: Resumen de búsqueda con mejor contraste */}
      {hasSearched && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div>
            {loading ? (
              <p className="text-slate-500 dark:text-slate-400">
                Buscando documentos...
              </p>
            ) : pagination.total > 0 ? (
              <p className="text-slate-600 dark:text-slate-300">
                Se encontraron <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> documento(s)
                {query && (
                  <>
                    {' '}para &ldquo;<span className="font-semibold text-slate-900 dark:text-white">{query}</span>&rdquo;
                  </>
                )}
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No se encontraron resultados
              </p>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar {activeFiltersCount} filtro(s)
            </Button>
          )}
        </div>
      )}

      {/* M2: Estados visuales claros */}
      <div id="search-results" tabIndex={-1} className="outline-none">
        {hasSearched ? (
          <>
            {/* Estado: Cargando */}
            {loading && (
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <LoadingState />
              </Card>
            )}
            
            {/* Estado: Sin resultados */}
            {showNoResults && (
              <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <NoResultsState 
                  query={query} 
                  hasFilters={activeFiltersCount > 0}
                  onClearFilters={handleClearFilters}
                />
              </Card>
            )}
            
            {/* Estado: Con resultados */}
            {showResults && (
              <>
                <SearchSummary
                  totalResults={pagination.total}
                  activeFilters={filters}
                  searchQuery={query}
                />
                <SearchResultsTable
                  results={results}
                  loading={loading}
                  pagination={pagination}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onViewExpediente={handleViewExpediente}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        ) : (
          /* Estado: Inicial (sin búsqueda) */
          <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <EmptyState onShowHelp={() => setShowAssistBanner(true)} />
          </Card>
        )}
      </div>

      <QuickPreviewModal
        document={selectedDocument}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedDocument(null);
        }}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
