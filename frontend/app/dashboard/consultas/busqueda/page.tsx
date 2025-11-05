'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, ChevronDown, ChevronUp, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdvancedSearchFilters from '@/components/search/AdvancedSearchFilters';
import SearchResultsTable from '@/components/search/SearchResultsTable';
import QuickPreviewModal from '@/components/search/QuickPreviewModal';
import SearchSummary from '@/components/search/SearchSummary';
import QuickPresetsBar from '@/components/search/QuickPresetsBar';
import SearchAssistBanner from '@/components/search/SearchAssistBanner';
import RecentQueriesDropdown from '@/components/search/RecentQueriesDropdown';
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

  // Keyboard shortcut for help
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowAssistBanner(true);
        }
      }
      
      if (e.key === 'Escape' && showRecentQueries) {
        setShowRecentQueries(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showRecentQueries]);

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

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-center justify-between" data-tour="search-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Búsqueda Avanzada</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Busca documentos por texto completo, metadatos y más
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartTour}
          className="gap-2 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700"
        >
          <HelpCircle className="h-4 w-4" />
          Iniciar Tour
        </Button>
      </div>

      {showAssistBanner && (
        <SearchAssistBanner 
          onDismiss={() => setShowAssistBanner(false)} 
          showDismiss={true}
        />
      )}

      <QuickPresetsBar onApplyPreset={handleApplyPreset} />

      <Card className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border-gray-200 dark:border-slate-700">
        <div className="space-y-4">
          {appliedSearchName && searchSource !== 'manual' && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                {searchSource === 'saved' ? 'Búsqueda Guardada' : 'Filtro Rápido'}: {appliedSearchName}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAppliedSearchName(null);
                  setSearchSource('manual');
                }}
                className="h-6 w-6 p-0 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar en documentos, anotaciones, OCR..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowRecentQueries(true)}
                className="pl-10 h-12 text-base border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                aria-label="Campo de búsqueda"
                data-tour="search-input"
              />
              <RecentQueriesDropdown
                isVisible={showRecentQueries}
                onSelectQuery={handleRecentQuerySelect}
                onClose={() => setShowRecentQueries(false)}
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
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
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              data-tour="search-filters-button"
            >
              {showFilters ? (
                <>
                  <ChevronUp className="h-5 w-5 mr-2" />
                  Ocultar Filtros
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </>
              )}
            </Button>
          </form>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
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

      {(query || activeFiltersCount > 0) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div>
            {pagination.total > 0 ? (
              <p className="text-gray-600 dark:text-slate-400">
                Se encontraron <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> documento(s)
                {query && (
                  <>
                    {' '}para &ldquo;<span className="font-semibold text-gray-900 dark:text-white">{query}</span>&rdquo;
                  </>
                )}
              </p>
            ) : (
              !loading && (
                <p className="text-gray-600 dark:text-slate-400">
                  No se encontraron resultados
                </p>
              )
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Limpiar {activeFiltersCount} filtro(s)
            </Button>
          )}
        </div>
      )}

      {(query || activeFiltersCount > 0) ? (
        <>
          {pagination.total > 0 && (
            <SearchSummary
              totalResults={pagination.total}
              activeFilters={filters}
              searchQuery={query}
            />
          )}
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
      ) : (
        <Card className="p-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border-gray-200 dark:border-slate-700">
          <div className="text-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-800 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Comienza una búsqueda
            </h3>
            <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto">
              Ingresa un término de búsqueda o aplica filtros para encontrar documentos.
              Puedes buscar por número de documento, remitente, contenido OCR y más.
            </p>
          </div>
        </Card>
      )}

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
