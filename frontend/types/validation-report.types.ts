export interface ValidationHistoryEntry {
  id: string;
  validatedAt: string;
  validatedBy: string;
  result: string;
  signatures: number;
  validSignatures: number;
  observations: string[];
}

export interface SignerInfo {
  id: string;
  name: string;
  email?: string;
  signedAt: string;
  certificateData: Record<string, unknown>;
}

export interface ReversionInfo {
  hasBeenReverted: boolean;
  revertedAt?: string;
  revertedBy?: string;
  reason?: string;
}

export interface ParsedSignature {
  number: number;
  signer: string;
  status: string;
  date: string;
  format: string;
  signatureAlgorithm: string;
  certificateData: {
    serial: string;
    issuerDN: string;
    subjectDN: string;
    notBefore: string;
    notAfter: string;
    rootInTsl: boolean;
    chain: string[];
    contactInfo: string;
  };
  timestampData: {
    type: string;
    date?: string;
    notes?: string;
    signatureAlgorithm?: string;
    serial?: string;
    notBefore?: string;
    notAfter?: string;
    rootInTsl?: boolean;
    chain?: string[];
    trustSigningTime: boolean;
  } | null;
  indications: string[];
  informations: string[];
  warnings: string[];
  errors: string[];
  notes: string[];
}

export interface CurrentValidation {
  result: string;
  validationDate: string;
  signatures: number;
  validSignatures: number;
  integrity: string;
  observations: string[];
  trustedSignatures: boolean;
  isValid: boolean;
  hasSignatures: boolean;
  parsedSignatures: ParsedSignature[];
}

export interface ValidationReportData {
  documentId: string;
  documentNumber: string;
  fileName: string;
  currentVersion: number;
  currentValidation: CurrentValidation | null;
  validationHistory: ValidationHistoryEntry[];
  signers: SignerInfo[];
  reversionInfo: ReversionInfo;
  recommendations: string[];
}
