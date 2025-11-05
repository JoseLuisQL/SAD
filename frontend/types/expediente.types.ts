import { Document } from './document.types';

export interface Expediente {
  id: string;
  code: string;
  name: string;
  description?: string;
  documents: Document[];
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    documents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpedienteFormData {
  code: string;
  name: string;
  description?: string;
}

export interface ExpedientesResponse {
  status: string;
  message: string;
  data: Expediente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ExpedienteResponse {
  status: string;
  message: string;
  data: Expediente;
}

export interface ExpedientesFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AddRemoveDocumentsData {
  documentIds: string[];
}

export interface ExpedienteActivity {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  details: {
    action: string;
    module: string;
    documents?: Array<{
      id: string;
      documentNumber: string;
      documentType: { name: string };
    }>;
    count?: number;
    documentIds?: string[];
    expedienteData?: Record<string, unknown>;
    changes?: {
      old: Record<string, unknown>;
      new: Record<string, unknown>;
    };
  };
  ipAddress: string;
}

export interface ExpedienteActivityResponse {
  status: string;
  message: string;
  data: ExpedienteActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExpedienteMetrics {
  totalExpedientes: number;
  documentosTotales: number;
  promedioDocumentosPorExpediente: number;
  expedientesPorOficina: Array<{
    officeId: string;
    officeName: string;
    count: number;
  }>;
  expedientesRecientes: Expediente[];
  distribucionPorTamano: {
    pequenos: number;
    medianos: number;
    grandes: number;
  };
}

export interface ExpedienteMetricsResponse {
  status: string;
  message: string;
  data: ExpedienteMetrics;
}

export interface ExpedienteAnalytics {
  expedienteId: string;
  expedienteCodigo: string;
  expedienteNombre: string;
  totalDocumentos: number;
  distribucionPorTipo: Array<{
    name: string;
    count: number;
  }>;
  timelineAdicion: Array<{
    mes: string;
    count: number;
  }>;
  oficinasRepresentadas: Array<{
    officeId: string;
    name: string;
    count: number;
  }>;
  usuariosAgregaron: Array<{
    userId: string;
    name: string;
    count: number;
  }>;
  estadoFirmas: {
    firmados: number;
    pendientes: number;
    sinFirmar: number;
  };
}

export interface ExpedienteAnalyticsResponse {
  status: string;
  message: string;
  data: ExpedienteAnalytics;
}
