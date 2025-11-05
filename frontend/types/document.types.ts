// Tipos para datos de firma y certificado
export interface SignatureData {
  algorithm?: string;
  value?: string;
  format?: string;
  [key: string]: unknown;
}

export interface CertificateData {
  subject?: string;
  issuer?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
  publicKey?: string;
  [key: string]: unknown;
}

export interface Document {
  id: string;
  archivador: {
    id: string;
    code: string;
    name: string;
  };
  documentType: {
    id: string;
    name: string;
  };
  office: {
    id: string;
    name: string;
  };
  documentNumber: string;
  documentDate: string;
  sender: string;
  folioCount: number;
  annotations?: string;
  ocrStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  ocrError?: string | null;
  fileName: string;
  fileSize: number;
  filePath?: string;
  currentVersion: number;
  signatureStatus?: 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';
  lastSignedAt?: string | null;
  signedBy?: string | null;
  signatures?: Signature[];
  creator: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  documentId: string;
  documentVersionId?: string;
  signerId: string;
  signer: {
    id: string;
    fullName: string;
  };
  signatureData: SignatureData;
  certificateData: CertificateData;
  timestamp: string;
  isValid: boolean;
  status: 'PENDING' | 'VALID' | 'INVALID' | 'INDETERMINATE';
  observations: string[];
  isReverted?: boolean;
  revertedAt?: string | null;
  revertedBy?: string | null;
  revertReason?: string | null;
  revertedByUser?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface DocumentMetadata {
  archivadorId: string;
  documentTypeId: string;
  officeId: string;
  documentNumber: string;
  documentDate: string;
  sender: string;
  folioCount: number;
  annotations?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    fullName: string;
  };
  uploadedAt: string;
  changes?: string;
}

export interface DocumentUploadResponse {
  status: string;
  message: string;
  data: Document;
}

export interface DocumentsResponse {
  status: string;
  message: string;
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DocumentResponse {
  status: string;
  message: string;
  data: Document;
}

export interface DocumentsFilters {
  page?: number;
  limit?: number;
  archivadorId?: string;
  documentTypeId?: string;
  officeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  signatureStatus?: string;
}

export interface BatchUploadItem {
  file: File;
  metadata: Omit<DocumentMetadata, 'archivadorId'>;
}

export interface BatchUploadResult {
  successful: Document[];
  failed: Array<{
    fileName: string;
    error: string;
  }>;
}

export interface UpdateDocumentData {
  documentTypeId?: string;
  officeId?: string;
  documentNumber?: string;
  documentDate?: string;
  sender?: string;
  folioCount?: number;
  annotations?: string;
}

// Analytics types
export interface DocumentIngestStats {
  totalDocumentos: number;
  documentosHoy: number;
  documentosSemana: number;
  documentosMes: number;
  documentosPorTipo: Array<{
    documentTypeId: string;
    documentTypeName: string;
    count: number;
  }>;
  documentosPorOficina: Array<{
    officeId: string;
    officeName: string;
    count: number;
  }>;
  estadoOCR: {
    pending: number;
    processing: number;
    completed: number;
    error: number;
  };
  topUsuariosIngesta: Array<{
    userId: string;
    fullName: string;
    count: number;
  }>;
}

export interface DocumentIngestStatsResponse {
  status: string;
  message: string;
  data: DocumentIngestStats;
}

export interface DocumentAnalytics {
  total: number;
  firmados: number;
  sinFirmar: number;
  ocrProcesados: number;
  ocrPendientes: number;
  documentosPorTipo: Array<{
    documentTypeId: string;
    documentTypeName: string;
    count: number;
  }>;
  documentosPorOficina: Array<{
    officeId: string;
    officeName: string;
    count: number;
  }>;
  topUsuariosCreadores: Array<{
    userId: string;
    fullName: string;
    count: number;
  }>;
  activos: number;
  capacidadArchivadores: Array<{
    archivadorId: string;
    archivadorName: string;
    totalDocumentos: number;
  }>;
}

export interface DocumentAnalyticsResponse {
  status: string;
  message: string;
  data: DocumentAnalytics;
}

export interface DocumentAnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  archivadorId?: string;
  documentTypeId?: string;
  officeId?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'downloaded' | 'signed' | 'ocr' | 'version';
  action: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    username: string;
    fullName: string;
  } | null;
  details?: {
    oldValue?: Record<string, unknown> | string | null;
    newValue?: Record<string, unknown> | string | null;
  };
}

export interface DocumentTimelineResponse {
  status: string;
  message: string;
  data: {
    documentId: string;
    documentNumber: string;
    timeline: TimelineEvent[];
  };
}
