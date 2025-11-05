export interface Office {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
}

export interface Period {
  id: string;
  year: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    archivadores: number;
  };
}

export interface CreateOfficeData {
  name: string;
  description?: string;
}

export interface UpdateOfficeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateDocumentTypeData {
  name: string;
  description?: string;
}

export interface UpdateDocumentTypeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePeriodData {
  year: number;
  description?: string;
}

export interface UpdatePeriodData {
  year?: number;
  description?: string;
  isActive?: boolean;
}

export interface OfficesResponse {
  status: string;
  message: string;
  data: {
    offices: Office[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OfficeResponse {
  status: string;
  message: string;
  data: Office;
}

export interface DocumentTypesResponse {
  status: string;
  message: string;
  data: {
    documentTypes: DocumentType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DocumentTypeResponse {
  status: string;
  message: string;
  data: DocumentType;
}

export interface PeriodsResponse {
  status: string;
  message: string;
  data: Period[];
}

export interface PeriodResponse {
  status: string;
  message: string;
  data: Period;
}

export interface OfficesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface DocumentTypesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
