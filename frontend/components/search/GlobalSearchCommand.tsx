'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  FolderOpen,
  Archive,
  Clock,
  Star,
  Search,
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { expedientesApi } from '@/lib/api/expedientes';
import { archivadoresApi } from '@/lib/api/archivadores';
import { useSearchPreferences } from '@/store/searchPreferences.store';
import { SearchResultDocument } from '@/types/search.types';
import QuickPreviewModal from './QuickPreviewModal';
import { toast } from 'sonner';

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExpedienteResult {
  id: string;
  code: string;
  name: string;
}

interface ArchivadorResult {
  id: string;
  code: string;
  name: string;
  _count?: { documents: number };
}

export default function GlobalSearchCommand({
  open,
  onOpenChange,
}: GlobalSearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [documentResults, setDocumentResults] = useState<SearchResultDocument[]>([]);
  const [expedienteResults, setExpedienteResults] = useState<ExpedienteResult[]>([]);
  const [archivadorResults, setArchivadorResults] = useState<ArchivadorResult[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<SearchResultDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingExpedientes, setLoadingExpedientes] = useState(false);
  const [loadingArchivadores, setLoadingArchivadores] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const { fetchSuggestions, suggestions, loadingSuggestions } = useSearch();
  const { savedSearches, recentQueries, addRecentQuery, applySavedSearch } = useSearchPreferences();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Effect para buscar cuando el query cambia (con debounce)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        // Buscar documentos (sugerencias)
        fetchSuggestions(query.trim());

        // Buscar expedientes
        setLoadingExpedientes(true);
        expedientesApi
          .search(query.trim())
          .then((res) => {
            if (res?.data?.data) {
              setExpedienteResults(res.data.data.slice(0, 5));
            } else {
              setExpedienteResults([]);
            }
          })
          .catch(() => {
            setExpedienteResults([]);
          })
          .finally(() => {
            setLoadingExpedientes(false);
          });

        // Buscar archivadores
        setLoadingArchivadores(true);
        archivadoresApi
          .search(query.trim())
          .then((res) => {
            if (res?.data?.data) {
              setArchivadorResults(res.data.data.slice(0, 5));
            } else {
              setArchivadorResults([]);
            }
          })
          .catch(() => {
            setArchivadorResults([]);
          })
          .finally(() => {
            setLoadingArchivadores(false);
          });
      }, 300);
    } else {
      // Solo limpiar si el query es muy corto
      setDocumentResults([]);
      setExpedienteResults([]);
      setArchivadorResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Effect separado para procesar suggestions cuando cambien
  useEffect(() => {
    console.log('=== GlobalSearchCommand: Procesando suggestions ===');
    console.log('Suggestions recibidas:', suggestions);
    console.log('Query actual:', query);
    console.log('Loading:', loadingSuggestions);

    if (suggestions.length > 0) {
      const documentsFound = suggestions.filter((s) => s.type === 'document' && s.metadata?.documentId);
      console.log('Documentos filtrados:', documentsFound);

      const docs = documentsFound.map((s) => ({
        id: s.metadata!.documentId!,
        documentNumber: s.value,
        documentDate: s.metadata!.documentDate || new Date().toISOString(),
        sender: s.metadata!.sender || 'Desconocido',
        documentType: {
          id: s.metadata!.typeId || '',
          name: s.metadata!.documentType || 'Documento',
          prefix: '',
        },
        office: {
          id: '',
          name: '',
        },
        archivador: {
          id: '',
          code: '',
          name: '',
        },
        fileName: '',
        fileSize: 0,
        folioCount: 0,
        ocrStatus: 'pending' as const,
      })) as SearchResultDocument[];

      console.log('Documentos mapeados:', docs);
      setDocumentResults(docs.slice(0, 5));
    } else if (query.trim().length >= 2 && !loadingSuggestions) {
      // Solo limpiar si ya terminó de buscar y no hay resultados
      console.log('Sin sugerencias, limpiando resultados');
      setDocumentResults([]);
    }
  }, [suggestions, query, loadingSuggestions]);

  const handleSelectDocument = (doc: SearchResultDocument, action: 'view' | 'preview' | 'download' = 'view') => {
    if (action === 'preview') {
      setSelectedDocument(doc);
      setPreviewOpen(true);
      return;
    }

    if (action === 'download') {
      handleDownload(doc);
      return;
    }

    router.push(`/dashboard/archivo/documentos/${doc.id}`);
    onOpenChange(false);
    addRecentQuery(query);
  };

  const handleSelectExpediente = (expediente: ExpedienteResult) => {
    router.push(`/dashboard/archivo/expedientes/${expediente.id}`);
    onOpenChange(false);
    addRecentQuery(query);
  };

  const handleSelectArchivador = (archivador: ArchivadorResult) => {
    router.push(`/dashboard/archivo/archivadores/${archivador.id}`);
    onOpenChange(false);
    addRecentQuery(query);
  };

  const handleSavedSearchSelect = (savedSearchId: string) => {
    const savedSearch = applySavedSearch(savedSearchId);
    if (savedSearch) {
      const searchParams = new URLSearchParams();
      searchParams.set('query', savedSearch.query);
      
      Object.entries(savedSearch.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });

      router.push(`/dashboard/consultas/busqueda?${searchParams.toString()}`);
      onOpenChange(false);
    }
  };

  const handleRecentQuerySelect = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  const handleFullSearch = () => {
    if (query.trim()) {
      router.push(`/dashboard/consultas/busqueda?query=${encodeURIComponent(query.trim())}`);
      onOpenChange(false);
      addRecentQuery(query);
    }
  };

  const handleDownload = async (doc: SearchResultDocument) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const downloadUrl = `${apiUrl}/documents/${doc.id}/download`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.fileName || `document-${doc.documentNumber}.pdf`;

      // Safely append, click, and remove
      if (document.body) {
        document.body.appendChild(link);
        link.click();

        // Use setTimeout to ensure click completes before removal
        setTimeout(() => {
          try {
            if (link.parentNode && document.contains(link)) {
              link.parentNode.removeChild(link);
            }
          } catch (cleanupError) {
            console.debug('Download cleanup skipped:', cleanupError);
          }
        }, 100);
      }

      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const hasResults =
    documentResults.length > 0 ||
    expedienteResults.length > 0 ||
    archivadorResults.length > 0;

  const loading = loadingSuggestions || loadingExpedientes || loadingArchivadores;
  const showEmptyState = query.trim().length >= 2 && !loading && !hasResults;
  const showSavedAndRecent = query.trim().length === 0 && (savedSearches.length > 0 || recentQueries.length > 0);

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput
          placeholder="Buscar documentos, expedientes, archivadores..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </div>
          ) : (
            <>
              {showEmptyState && (
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <Search className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-1">No se encontraron resultados</p>
                    <p className="text-xs text-slate-500">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {documentResults.length > 0 && (
                <>
                  <CommandGroup heading="Documentos">
                    {documentResults.map((doc) => (
                      <CommandItem
                        key={doc.id}
                        value={`doc-${doc.id}`}
                        onSelect={() => handleSelectDocument(doc, 'view')}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {doc.documentNumber}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {doc.documentType.name} • {doc.sender}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-medium text-slate-600">
                            ⏎
                          </kbd>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {expedienteResults.length > 0 && (
                <>
                  <CommandGroup heading="Expedientes">
                    {expedienteResults.map((exp) => (
                      <CommandItem
                        key={exp.id}
                        value={`exp-${exp.id}`}
                        onSelect={() => handleSelectExpediente(exp)}
                        className="flex items-center gap-3"
                      >
                        <FolderOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {exp.code}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{exp.name}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {archivadorResults.length > 0 && (
                <>
                  <CommandGroup heading="Archivadores">
                    {archivadorResults.map((arch) => (
                      <CommandItem
                        key={arch.id}
                        value={`arch-${arch.id}`}
                        onSelect={() => handleSelectArchivador(arch)}
                        className="flex items-center gap-3"
                      >
                        <Archive className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {arch.code}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {arch.name}
                            {arch._count?.documents && ` • ${arch._count.documents} docs`}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {showSavedAndRecent && (
                <>
                  {savedSearches.length > 0 && (
                    <>
                      <CommandGroup heading="Búsquedas Guardadas">
                        {savedSearches.slice(0, 5).map((saved) => (
                          <CommandItem
                            key={saved.id}
                            value={`saved-${saved.id}`}
                            onSelect={() => handleSavedSearchSelect(saved.id)}
                            className="flex items-center gap-3"
                          >
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {saved.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{saved.query}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]"
                            >
                              Guardada
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {recentQueries.length > 0 && (
                    <CommandGroup heading="Búsquedas Recientes">
                      {recentQueries.map((recent, idx) => (
                        <CommandItem
                          key={`recent-${idx}`}
                          value={`recent-${idx}`}
                          onSelect={() => handleRecentQuerySelect(recent)}
                          className="flex items-center gap-3"
                        >
                          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <p className="text-sm text-slate-700 truncate">{recent}</p>
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]"
                          >
                            Reciente
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}

              {hasResults && query.trim().length >= 2 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleFullSearch}
                      className="flex items-center justify-center gap-2 text-blue-600 font-medium"
                    >
                      <Search className="h-4 w-4" />
                      Ver todos los resultados para &quot;{query}&quot;
                    </CommandItem>
                  </CommandGroup>
                </>
              )}

              {!hasResults && !showSavedAndRecent && !loading && query.trim().length === 0 && (
                <div className="p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Búsqueda Global Inteligente
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Busca documentos, expedientes y archivadores
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium">
                        {isMac ? '⌘' : 'Ctrl'}
                      </kbd>
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium">
                        K
                      </kbd>
                      <span>para abrir</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium">
                        ESC
                      </kbd>
                      <span>para cerrar</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>

      <QuickPreviewModal
        document={selectedDocument}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedDocument(null);
        }}
        onDownload={handleDownload}
      />
    </>
  );
}
