'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Search, 
  FileText, 
  X, 
  ChevronDown, 
  Loader2,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { documentsApi } from '@/lib/api/documents';
import { Document } from '@/types/document.types';
import { toast } from 'sonner';

interface DocumentSelectorProps {
  value?: string;
  onChange: (documentId: string | undefined, document: Document | undefined) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function DocumentSelector({ 
  value, 
  onChange, 
  onBlur, 
  error = false,
  disabled = false 
}: DocumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Cargar documento seleccionado inicialmente
  useEffect(() => {
    if (value && !selectedDocument) {
      const fetchSelectedDocument = async () => {
        try {
          const response = await documentsApi.getById(value);
          const doc = response.data.data;
          if (doc) {
            setSelectedDocument(doc);
          }
        } catch (error) {
          console.error('Error al cargar documento seleccionado:', error);
        }
      };
      fetchSelectedDocument();
    }
  }, [value, selectedDocument]);

  // Buscar documentos cuando cambia el query
  useEffect(() => {
    if (!isOpen) return;
    
    const searchDocuments = async () => {
      if (debouncedSearch.length < 2 && debouncedSearch.length > 0) {
        return;
      }

      try {
        setLoading(true);
        const response = await documentsApi.getAll({ 
          page: 1, 
          limit: 20,
          search: debouncedSearch || undefined
        });
        
        const responseData = response.data.data as { documents?: Document[] } | Document[];
        const documentsData = Array.isArray(responseData) 
          ? responseData 
          : (responseData?.documents || []);
        
        setDocuments(documentsData);
        setHasSearched(true);
      } catch (error) {
        console.error('Error al buscar documentos:', error);
        toast.error('Error al buscar documentos');
      } finally {
        setLoading(false);
      }
    };

    searchDocuments();
  }, [debouncedSearch, isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const handleSelect = useCallback((doc: Document) => {
    setSelectedDocument(doc);
    onChange(doc.id, doc);
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedDocument(undefined);
    onChange(undefined, undefined);
    setSearchQuery('');
  }, [onChange]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [disabled]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Campo de seleccion */}
      {!isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 
            bg-white dark:bg-slate-800 border rounded-lg
            text-left transition-colors
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          `}
        >
          {selectedDocument ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {selectedDocument.documentNumber}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {selectedDocument.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Limpiar seleccion"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Search className="h-4 w-4" />
              <span>Buscar y seleccionar documento...</span>
            </div>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe para buscar por numero o nombre..."
            className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                         hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 
                        dark:border-slate-700 rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          {/* Mensaje de ayuda */}
          {!hasSearched && searchQuery.length < 2 && (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p>Escribe al menos 2 caracteres para buscar</p>
              <p className="text-xs mt-1">o deja vacio para ver los mas recientes</p>
            </div>
          )}

          {/* Estado de carga */}
          {loading && (
            <div className="p-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando documentos...
            </div>
          )}

          {/* Lista de resultados */}
          {!loading && hasSearched && (
            <div className="overflow-y-auto max-h-[280px]">
              {documents.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p>No se encontraron documentos</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">
                      Intenta con otros terminos de busqueda
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-1">
                  {documents.map((doc) => {
                    const isSelected = doc.id === value;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelect(doc)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                          ${isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }
                        `}
                      >
                        <div className={`
                          p-1.5 rounded 
                          ${isSelected 
                            ? 'bg-blue-100 dark:bg-blue-800' 
                            : 'bg-slate-100 dark:bg-slate-800'
                          }
                        `}>
                          <FileText className={`
                            h-4 w-4 
                            ${isSelected 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-slate-500 dark:text-slate-400'
                            }
                          `} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`
                              font-medium truncate
                              ${isSelected 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-slate-900 dark:text-slate-100'
                              }
                            `}>
                              {doc.documentNumber}
                            </p>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {doc.fileName}
                          </p>
                          {doc.createdAt && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {formatDate(doc.createdAt)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer con contador */}
          {!loading && hasSearched && documents.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 
                            bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
              {documents.length} documento{documents.length !== 1 ? 's' : ''} encontrado{documents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
