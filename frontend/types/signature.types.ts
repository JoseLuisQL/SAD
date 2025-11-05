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
  createdAt: string;
}

export interface FirmaPeruConfig {
  clientWebUrl: string;
  localServerPort: number;
}

export interface OneTimeTokenResponse {
  status: string;
  message: string;
  data: {
    oneTimeToken: string;
  };
}

export interface SignerFlowData {
  userId: string;
  order: number;
  signedAt?: string;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  signatureId?: string;
  user?: { id: string; fullName: string; email: string; };
}

export interface SignatureFlow {
  id: string;
  name: string;
  documentId: string;
  document: { 
    id: string; 
    fileName: string; 
    documentNumber: string;
    documentType?: { id: string; name: string; };
    documentTypeId?: string;
  };
  signers: SignerFlowData[];
  currentStep: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdBy: { 
    id: string; 
    firstName?: string; 
    lastName?: string;
    username?: string;
  };
  createdById: string;
  createdAt: string;
  updatedAt: string;
  progressPercent?: number;
  signedCount?: number;
  totalSigners?: number;
}
