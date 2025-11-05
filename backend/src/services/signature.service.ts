import { Request } from 'express';
import * as documentsService from './documents.service';
import * as firmaPeruService from './firma-peru.service';
import { log } from './audit.service';
// import * as notificationsService from './notifications.service';
import prisma from '../config/database';

interface SignDocumentParams {
  documentId: string;
  signerId: string;
  documentExtension: string;
  signedFileBuffer: Buffer;
  req: Request;
}

interface SignDocumentResult {
  documentId: string;
  status: 'success' | 'error';
  validationData?: any;
  error?: string;
}

export const signDocument = async ({
  documentId,
  signerId,
  documentExtension,
  signedFileBuffer,
  req
}: SignDocumentParams): Promise<SignDocumentResult> => {
  try {
    // Verificar el estado del documento antes de firmar
    const docToSign = await prisma.document.findUnique({
      where: { id: documentId },
      select: { 
        signatureStatus: true, 
        fileName: true,
        createdBy: true
      }
    });

    if (!docToSign) {
      throw new Error('Documento no encontrado');
    }

    // Validar que el documento no esté ya firmado completamente
    if (docToSign.signatureStatus === 'SIGNED') {
      throw new Error('Este documento ya está firmado. No se permite firmar documentos ya firmados desde este módulo.');
    }

    await log({
      userId: signerId,
      action: 'DOCUMENT_SIGN_ATTEMPT',
      module: 'signatures',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        documentId,
        documentExtension,
        currentStatus: docToSign.signatureStatus
      },
      req
    });

    const validationResult = await firmaPeruService.validateSignature(
      signedFileBuffer,
      documentExtension
    );

    if (validationResult.errorMessage) {
      throw new Error(`Error en validación: ${validationResult.errorMessage}`);
    }

    if (!validationResult.listSignatures || validationResult.listSignatures.length === 0) {
      throw new Error('No se encontraron firmas válidas en el documento');
    }

    const firstSignature = validationResult.listSignatures[0];
    const signatureData = {
      signer: firstSignature.signer,
      date: firstSignature.date,
      format: firstSignature.format,
      signatureAlgorithm: firstSignature.signatureAlgorithm,
      serial: firstSignature.serial,
      subjectDN: firstSignature.subjectDN,
      issuerDN: firstSignature.issuerDN,
      contactInfo: firstSignature.contactInfo,
      indications: firstSignature.indications,
      informations: firstSignature.informations,
      warnings: firstSignature.warnings,
      errors: firstSignature.errors,
      notes: firstSignature.notes
    };

    const certificateData = {
      notBeFore: firstSignature.notBeFore,
      notAfter: firstSignature.notAfter,
      rootInTsl: firstSignature.rootInTsl,
      chain: firstSignature.chain,
      trustSigningTime: firstSignature.trustSigningTime,
      timestampType: firstSignature.timestampType,
      tsaNotes: firstSignature.tsaNotes,
      tsaDate: firstSignature.tsaDate,
      tsaSignatureAlgorithm: firstSignature.tsaSignatureAlgorithm,
      rootTsaInTsl: firstSignature.rootTsaInTsl,
      tsaSerial: firstSignature.tsaSerial,
      tsaNotBeFore: firstSignature.tsaNotBeFore,
      tsaNotAfter: firstSignature.tsaNotAfter,
      tsaChain: firstSignature.tsaChain
    };

    const validationStatus = firstSignature.status || 'PENDIENTE';
    const observations = [
      ...validationResult.observations,
      ...firstSignature.indications,
      ...firstSignature.warnings,
      ...firstSignature.errors
    ].filter(Boolean);

    await documentsService.updateDocumentSignedFile(
      documentId,
      signedFileBuffer,
      signatureData,
      certificateData,
      signerId,
      validationStatus,
      observations,
      req
    );

    await log({
      userId: signerId,
      action: 'DOCUMENT_SIGNED',
      module: 'signatures',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        documentId,
        status: validationStatus,
        signer: signatureData.signer,
        validSignatures: validationResult.validSignatures,
        totalSignatures: validationResult.signatures
      },
      req
    });

    if (docToSign && docToSign.createdBy !== signerId) {
      // const signer = await prisma.user.findUnique({
      //   where: { id: signerId },
      //   select: { firstName: true, lastName: true }
      // });

      // const signerName = signer ? `${signer.firstName} ${signer.lastName}` : 'Un usuario';

      // await notificationsService.createSignatureCompletedNotification(
      //   [docToSign.createdBy],
      //   documentId,
      //   docToSign.fileName,
      //   signerName
      // );
    }

    return {
      documentId,
      status: 'success',
      validationData: {
        result: validationResult.result,
        validationDate: validationResult.validationDate,
        signatures: validationResult.signatures,
        validSignatures: validationResult.validSignatures,
        integrity: validationResult.integrity,
        observations: validationResult.observations,
        trustedSignatures: validationResult.trustedSignatures,
        signatureDetails: signatureData,
        certificateDetails: certificateData
      }
    };
  } catch (error) {
    await log({
      userId: signerId,
      action: 'DOCUMENT_SIGN_FAILED',
      module: 'signatures',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        documentId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      req
    });

    return {
      documentId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido al firmar documento'
    };
  }
};

export const signMultipleDocuments = async (
  documents: Array<{
    documentId: string;
    signedFileBuffer: Buffer;
    documentExtension: string;
  }>,
  signerId: string,
  req: Request
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: SignDocumentResult[];
}> => {
  const results: SignDocumentResult[] = [];
  let successful = 0;
  let failed = 0;

  await log({
    userId: signerId,
    action: 'DOCUMENT_BATCH_SIGN_ATTEMPT',
    module: 'signatures',
    entityType: 'Document',
    entityId: 'batch',
    newValue: {
      totalDocuments: documents.length
    },
    req
  });

  const signPromises = documents.map(async (doc) => {
    const result = await signDocument({
      documentId: doc.documentId,
      signerId,
      documentExtension: doc.documentExtension,
      signedFileBuffer: doc.signedFileBuffer,
      req
    });

    if (result.status === 'success') {
      successful++;
    } else {
      failed++;
    }

    return result;
  });

  const completedResults = await Promise.allSettled(signPromises);

  completedResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      failed++;
      results.push({
        documentId: 'unknown',
        status: 'error',
        error: result.reason instanceof Error ? result.reason.message : 'Error desconocido'
      });
    }
  });

  await log({
    userId: signerId,
    action: 'DOCUMENT_BATCH_SIGN_COMPLETED',
    module: 'signatures',
    entityType: 'Document',
    entityId: 'batch',
    newValue: {
      total: documents.length,
      successful,
      failed
    },
    req
  });

  return {
    total: documents.length,
    successful,
    failed,
    results
  };
};

export default {
  signDocument,
  signMultipleDocuments
};
