import { Request } from 'express';
import * as firmaPeruService from './firma-peru.service';
import * as documentsService from './documents.service';
import * as path from 'path';
import { log } from './audit.service';
import prisma from '../config/database';

interface VerificationResult {
  documentId?: string;
  result: string;
  validationDate: string;
  file: string;
  signatures: number;
  validSignatures: number;
  integrity: string;
  observations: string[];
  trustedSignatures: boolean;
  errorMessage: string | null;
  generatedBy: string;
  detailedReport: string;
  isValid: boolean;
  hasSignatures: boolean;
  parsedSignatures: any[];
}

export const verifyDocumentSignatures = async (
  documentId: string,
  userId: string,
  req: Request
): Promise<VerificationResult> => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    const documentBuffer = await documentsService.getDocumentFileBuffer(documentId);
    const documentExtension = path.extname(document.fileName).substring(1).toLowerCase();

    const validationResponse = await firmaPeruService.validateSignature(
      documentBuffer,
      documentExtension
    );

    const parsedResult = firmaPeruService.parseFirmaPeruValidationResponse(validationResponse);

    await log({
      userId: userId,
      action: 'SIGNATURE_VERIFIED',
      module: 'verification',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        result: parsedResult.result,
        signatures: parsedResult.signatures,
        validSignatures: parsedResult.validSignatures,
        isValid: parsedResult.isValid,
      },
      req,
    });

    return {
      ...parsedResult,
      documentId,
    };
  } catch (error) {
    await log({
      userId: userId,
      action: 'SIGNATURE_VERIFICATION_FAILED',
      module: 'verification',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      req,
    });

    throw error;
  }
};

export const verifyUploadedDocument = async (
  fileBuffer: Buffer,
  documentExtension: string,
  userId: string,
  req: Request
): Promise<VerificationResult> => {
  try {
    const validationResponse = await firmaPeruService.validateSignature(
      fileBuffer,
      documentExtension
    );

    const parsedResult = firmaPeruService.parseFirmaPeruValidationResponse(validationResponse);

    await log({
      userId: userId,
      action: 'SIGNATURE_VERIFIED_UPLOAD',
      module: 'verification',
      entityType: 'Upload',
      entityId: 'ad-hoc',
      newValue: {
        result: parsedResult.result,
        signatures: parsedResult.signatures,
        validSignatures: parsedResult.validSignatures,
        isValid: parsedResult.isValid,
      },
      req,
    });

    return parsedResult;
  } catch (error) {
    await log({
      userId: userId,
      action: 'SIGNATURE_VERIFICATION_FAILED',
      module: 'verification',
      entityType: 'Upload',
      entityId: 'ad-hoc',
      newValue: {
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      req,
    });

    throw error;
  }
};

export default {
  verifyDocumentSignatures,
  verifyUploadedDocument,
};
