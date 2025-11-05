export interface PhysicalLocation {
  estante: string;
  modulo: string;
  descripcion?: string;
}

export interface Archivador {
  id: string;
  code: string;
  name: string;
  periodId: string;
  physicalLocation: PhysicalLocation;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  period: {
    id: string;
    year: number;
    description?: string;
  };
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    documents: number;
  };
}

export interface ArchivadorWithDocuments extends Archivador {
  documents: Array<{
    id: string;
    documentNumber: string;
    documentDate: string;
    sender: string;
    folioCount: number;
    documentType: {
      id: string;
      name: string;
    };
    office: {
      id: string;
      name: string;
    };
  }>;
  stats?: {
    totalDocuments: number;
    totalFolios: number;
    documentsByType: Record<string, number>;
    documentsByOffice: Record<string, number>;
  };
}

export interface CreateArchivadorData {
  code: string;
  name: string;
  periodId: string;
  physicalLocation: PhysicalLocation;
}

export interface UpdateArchivadorData {
  name?: string;
  periodId?: string;
  physicalLocation?: PhysicalLocation;
}

export interface ArchivadoresResponse {
  status: string;
  message: string;
  data: Archivador[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ArchivadorResponse {
  status: string;
  message: string;
  data: ArchivadorWithDocuments;
}

export interface ArchivadorStatsResponse {
  status: string;
  message: string;
  data: {
    totalDocuments: number;
    totalFolios: number;
    documentsByType: Record<string, number>;
    documentsByOffice: Record<string, number>;
  };
}

export interface ArchivadoresFilters {
  page?: number;
  limit?: number;
  periodId?: string;
  search?: string;
}

export interface ArchivadorSearchResponse {
  status: string;
  message: string;
  data: Array<{
    id: string;
    code: string;
    name: string;
    period: {
      id: string;
      year: number;
    };
    _count: {
      documents: number;
    };
  }>;
}

export interface ArchivadorAnalyticsOverview {
  totalArchivadores: number;
  documentosTotal: number;
  capacidadUtilizada: number;
  archivadoresPorPeriodo: Array<{
    periodYear: number;
    count: number;
    documentosCount: number;
  }>;
  topArchivadoresMasUsados: Array<{
    archivadorId: string;
    code: string;
    name: string;
    documentosCount: number;
  }>;
  distribucionPorUbicacion: Array<{
    ubicacion: string;
    count: number;
  }>;
  recentArchivadores: Archivador[];
}

export interface ArchivadorGeneralStatsResponse {
  status: string;
  message: string;
  data: ArchivadorAnalyticsOverview;
}

export interface ArchivadorAnalytics {
  totalDocumentos: number;
  distribucionPorTipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
  documentosPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
  oficinasMasRepresentadas: Array<{
    oficina: string;
    cantidad: number;
  }>;
  estadoArchivador: 'vacio' | 'medio' | 'lleno';
  porcentajeOcupacion: number;
}

export interface ArchivadorAnalyticsResponse {
  status: string;
  message: string;
  data: ArchivadorAnalytics;
}
