import { useState, useCallback } from 'react';
import { searchApi } from '@/lib/api/search';
import {
  SearchResultDocument,
  SearchFilters,
  SearchPagination,
  SearchSort,
  SearchSuggestion,
} from '@/types/search.types';
import { toast } from 'sonner';

export function useSearch() {
  const [results, setResults] = useState<SearchResultDocument[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const searchDocuments = useCallback(
    async (
      query: string,
      filters: SearchFilters = {},
      paginationParams: SearchPagination = {},
      sortParams: SearchSort = {},
      source: 'manual' | 'saved' | 'preset' = 'manual'
    ) => {
      try {
        setLoading(true);

        console.log('=== HOOK useSearch: Preparando búsqueda ===');
        console.log('Query:', query);
        console.log('Filters:', filters);
        console.log('Pagination:', paginationParams);
        console.log('Sort:', sortParams);
        console.log('Source:', source);

        const params = {
          query: query?.trim() || undefined,
          ...filters,
          page: paginationParams.page || 1,
          limit: paginationParams.limit || 10,
          sortField: sortParams.sortField || 'documentDate',
          sortOrder: sortParams.sortOrder || 'desc',
          source,
        };

        console.log('=== HOOK useSearch: Params finales ===', params);

        const response = await searchApi.searchDocuments(params);

        if (!response || !response.data) {
          throw new Error('Respuesta vacía del servidor');
        }

        setResults(response.data.data);
        setPagination(response.data.pagination);

        return response.data;
      } catch (error: unknown) {
        console.error('Error en búsqueda:', error);

        let errorMessage = 'Error al realizar la búsqueda';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const apiError = error as { message?: string; status?: number };
          if (apiError.message) {
            errorMessage = apiError.message;
          }
        }

        toast.error(errorMessage);
        setResults([]);
        setPagination({ page: 1, total: 0, totalPages: 0 });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);

      const response = await searchApi.getSuggestions(query.trim());

      if (response && response.data && response.data.data) {
        setSuggestions(response.data.data);
      } else {
        setSuggestions([]);
      }
    } catch (error: unknown) {
      console.error('Error al obtener sugerencias:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setPagination({ page: 1, total: 0, totalPages: 0 });
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    results,
    suggestions,
    loading,
    loadingSuggestions,
    pagination,
    searchDocuments,
    fetchSuggestions,
    clearResults,
    clearSuggestions,
  };
}
