export interface SearchResultDocument {
  id: string;
  documentNumber: string;
  documentDate: string;
  sender: string;
  folioCount: number;
  annotations?: string;
  ocrContent?: string;
  office: {
    id: string;
    name: string;
  };
  documentType: {
    id: string;
    name: string;
  };
  archivador: {
    id: string;
    code: string;
    name: string;
    period?: {
      year: number;
    };
  };
  expediente?: {
    id: string;
    code: string;
    name: string;
  } | null;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  fileName: string;
  fileSize: number;
  currentVersion: number;
  ocrStatus?: string;
  createdAt: string;
  updatedAt: string;
  searchMetadata?: {
    ocrSnippets: string[];
    annotationSnippets: string[];
    matchedTerms: string[];
    hasOcrMatch: boolean;
    hasAnnotationMatch: boolean;
  };
}

export interface SearchFilters {
  documentNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  documentTypeId?: string;
  sender?: string;
  officeId?: string;
  archivadorId?: string;
  periodId?: string;
  expedienteId?: string;
}

export interface SearchPagination {
  page?: number;
  limit?: number;
}

export interface SearchSort {
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends SearchFilters, SearchPagination, SearchSort {
  query?: string;
}

export interface SearchResponse {
  status: string;
  message: string;
  data: SearchResultDocument[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchSuggestion {
  value: string;
  label: string;
  type: 'document' | 'sender' | 'documentType' | 'term';
  metadata?: {
    documentType?: string;
    typeName?: string;
  };
}

export interface SuggestionsResponse {
  status: string;
  message: string;
  data: SearchSuggestion[];
}
