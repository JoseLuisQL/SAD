export interface GlobalMetrics {
  archivadores: {
    total: number;
    documentosTotal: number;
    capacidadUtilizada: number;
  };
  documentos: {
    total: number;
    nuevosUltimos30Dias: number;
    conFirmaDigital: number;
    sinFirmaDigital: number;
    erroresOCR: number;
    pendientesOCR: number;
  };
  expedientes: {
    total: number;
    conDocumentos: number;
    sinDocumentos: number;
    promedioDocumentosPorExpediente: number;
  };
}

export interface DocumentMetrics {
  totalDocuments: number;
  newDocuments: number;
  signedDocuments: number;
  unsignedDocuments: number;
  partiallySignedDocuments: number;
  ocrPendingDocuments: number;
  ocrErrorDocuments: number;
  ocrCompletedDocuments: number;
  documentsByType: Array<{
    typeId: string;
    typeName: string;
    count: number;
    percentage: number;
  }>;
  documentsByOffice: Array<{
    officeId: string;
    officeName: string;
    count: number;
    percentage: number;
  }>;
  documentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  averageFolioCount: number;
  topSenders: Array<{
    sender: string;
    count: number;
  }>;
}

export interface ArchivadorMetrics {
  totalDocuments: number;
  totalFolios: number;
  signedDocuments: number;
  ocrCompletedDocuments: number;
  documentsByType: Array<{
    typeId: string;
    typeName: string;
    count: number;
  }>;
  documentsByOffice: Array<{
    officeId: string;
    officeName: string;
    count: number;
  }>;
  documentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  estadoArchivador: string;
  porcentajeOcupacion: number;
  averageFolioCount: number;
}

export interface ExpedienteMetrics {
  totalDocuments: number;
  totalFolios: number;
  signedDocuments: number;
  documentsByType: Array<{
    typeId: string;
    typeName: string;
    count: number;
  }>;
  documentsByArchivador: Array<{
    archivadorId: string;
    archivadorCode: string;
    archivadorName: string;
    count: number;
  }>;
  averageFolioCount: number;
}

export interface PeriodFilter {
  startDate: Date;
  endDate: Date;
}
