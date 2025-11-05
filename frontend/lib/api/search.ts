import api from '../api';
import {
  SearchResponse,
  SuggestionsResponse,
  SearchParams,
} from '@/types/search.types';

export const searchApi = {
  searchDocuments: (params: SearchParams) => {
    console.log('=== API SEARCH: Enviando parámetros ===', params);
    
    const cleanParams: any = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    
    console.log('=== API SEARCH: Parámetros limpiados ===', cleanParams);
    
    return api.get<SearchResponse>('/search/documents', { params: cleanParams });
  },

  getSuggestions: (q: string) => {
    return api.get<SuggestionsResponse>('/search/suggestions', { params: { q } });
  },
};
