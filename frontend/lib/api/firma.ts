import api from '../api';
import { FirmaPeruConfig, OneTimeTokenResponse, SignatureFlow } from '@/types/signature.types';
import { ValidationReportData } from '@/types/validation-report.types';

export const firmaApi = {
  /**
   * Obtiene la configuración del componente web de Firma Perú
   */
  getFirmaPeruConfig: () => {
    return api.get<{ status: string; message: string; data: FirmaPeruConfig }>('/firma/config');
  },

  /**
   * Solicita un token de un solo uso para iniciar el proceso de firma
   * @param documentId ID del documento a firmar
   * @param signatureReason Razón de la firma
   * @param imageToStamp URL de imagen para estampar (opcional)
   * @param flowId ID del flujo de firma (opcional)
   */
  getSignatureParams: (documentId: string, signatureReason: string, imageToStamp?: string, flowId?: string) => {
    return api.post<OneTimeTokenResponse>('/firma/params-request', {
      documentId,
      signatureReason,
      imageToStamp,
      flowId,
    });
  },

  /**
   * Crea un nuevo flujo de firma
   */
  createSignatureFlow: (documentId: string, name: string, signers: Array<{ userId: string; order: number }>) => {
    return api.post('/firma/flows', { documentId, name, signers });
  },

  /**
   * Obtiene todos los flujos de firma con filtros opcionales
   */
  getAllSignatureFlows: (filters?: any) => {
    return api.get<{ 
      status: string; 
      message: string; 
      data: { 
        flows: SignatureFlow[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        metadata: {
          totalByStatus: Record<string, number>;
          totalFlows: number;
        };
      } 
    }>('/firma/flows', { params: filters });
  },

  /**
   * Obtiene un flujo de firma por ID
   */
  getSignatureFlowById: (id: string) => {
    return api.get<{ status: string; message: string; data: SignatureFlow }>(`/firma/flows/${id}`);
  },

  /**
   * Obtiene los flujos de firma pendientes del usuario actual
   */
  getPendingSignatureFlows: () => {
    return api.get<{ status: string; message: string; data: SignatureFlow[] }>('/firma/flows/pending');
  },

  /**
   * Cancela un flujo de firma
   */
  cancelSignatureFlow: (id: string) => {
    return api.post(`/firma/flows/${id}/cancel`);
  },

  /**
   * Obtiene el reporte completo de validación de un documento
   */
  getValidationReport: (documentId: string) => {
    return api.get<{ 
      status: string; 
      message: string; 
      data: ValidationReportData;
    }>(`/firma/validation-report/${documentId}`);
  },
};
