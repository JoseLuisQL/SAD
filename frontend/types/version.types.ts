// Types para el sistema de versiones y reversión de firmas

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

export interface Version {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  filePath: string;
  changeDescription: string;
  createdBy: string;
  createdAt: string;
  fileSize: number;
  hasSignatures: boolean;
  activeSignaturesCount: number;
  revertedSignaturesCount: number;
  isCurrent: boolean;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  signatures?: Signature[];
}

export interface Signature {
  id: string;
  documentId: string;
  documentVersionId: string | null;
  signerId: string;
  signatureData: SignatureData;
  certificateData: CertificateData;
  timestamp: string;
  isValid: boolean;
  status: string;
  observations: string;
  isReverted: boolean;
  revertedAt: string | null;
  revertedBy: string | null;
  revertReason: string | null;
  createdAt: string;
  signer: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  revertedByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  version?: {
    id: string;
    versionNumber: number;
  };
}

export interface ComparisonData {
  version1: Version;
  version2: Version;
  differences: {
    versionNumber: number;
    sizeChange: number;
    timeElapsed: number;
    signaturesAdded: number;
    creatorChanged: boolean;
  };
}

export interface ReversionSummary {
  documentId: string;
  revertedSignaturesCount: number;
  affectedUsers: string[];
  revertedAt: string;
  revertedBy: string;
  reason: string;
}

export interface ReversionHistory {
  revertedAt: string;
  revertedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  signatures: Signature[];
}

export interface CanRevertResponse {
  canRevert: boolean;
  reason?: string;
  activeSignatures?: number;
  documentStatus?: string;
}

export type SignatureStatus = 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED';

export interface RevertOptions {
  notifySigners?: boolean;
  createNewVersion?: boolean;
}
