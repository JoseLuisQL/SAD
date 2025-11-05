import { Request } from 'express';
import prisma from '../config/database';
import * as firmaPeruService from './firma-peru.service';
import * as documentsService from './documents.service';
import * as path from 'path';

interface ValidationHistoryEntry {
  id: string;
  validatedAt: string;
  validatedBy: string;
  result: string;
  signatures: number;
  validSignatures: number;
  observations: string[];
}

interface SignerInfo {
  id: string;
  name: string;
  email?: string;
  signedAt: string;
  certificateData: any;
}

interface ReversionInfo {
  hasBeenReverted: boolean;
  revertedAt?: string;
  revertedBy?: string;
  reason?: string;
}

interface ValidationReportData {
  documentId: string;
  documentNumber: string;
  fileName: string;
  currentVersion: number;
  currentValidation: {
    result: string;
    validationDate: string;
    signatures: number;
    validSignatures: number;
    integrity: string;
    observations: string[];
    trustedSignatures: boolean;
    isValid: boolean;
    hasSignatures: boolean;
    parsedSignatures: any[];
  } | null;
  validationHistory: ValidationHistoryEntry[];
  signers: SignerInfo[];
  reversionInfo: ReversionInfo;
  recommendations: string[];
}

const generateRecommendations = (data: ValidationReportData): string[] => {
  const recommendations: string[] = [];

  if (!data.currentValidation) {
    recommendations.push('Se recomienda validar el documento para verificar su integridad.');
    return recommendations;
  }

  const { currentValidation } = data;

  // Verificar si es válido
  if (!currentValidation.isValid) {
    recommendations.push('⚠️ El documento presenta firmas inválidas. Verifique la autenticidad del documento.');
  }

  // Verificar integridad
  if (currentValidation.integrity !== 'ÍNTEGRO' && currentValidation.integrity !== 'OK') {
    recommendations.push('⚠️ La integridad del documento ha sido comprometida. El documento puede haber sido modificado después de la firma.');
  }

  // Verificar firmas confiables
  if (!currentValidation.trustedSignatures) {
    recommendations.push('⚠️ Las firmas no provienen de certificados confiables. Verifique el origen de los certificados.');
  }

  // Verificar observaciones
  if (currentValidation.observations && currentValidation.observations.length > 0) {
    recommendations.push(`ℹ️ Se encontraron ${currentValidation.observations.length} observación(es) durante la validación. Revise los detalles.`);
  }

  // Verificar cantidad de firmas
  if (currentValidation.signatures !== currentValidation.validSignatures) {
    const invalidCount = currentValidation.signatures - currentValidation.validSignatures;
    recommendations.push(`⚠️ ${invalidCount} de ${currentValidation.signatures} firma(s) no son válidas.`);
  }

  // Verificar si ha sido revertido
  if (data.reversionInfo.hasBeenReverted) {
    recommendations.push('ℹ️ Este documento ha sido revertido a una versión anterior. Verifique el historial de reversiones.');
  }

  // Si todo está bien
  if (
    currentValidation.isValid &&
    (currentValidation.integrity === 'ÍNTEGRO' || currentValidation.integrity === 'OK') &&
    currentValidation.trustedSignatures &&
    currentValidation.signatures === currentValidation.validSignatures &&
    (!currentValidation.observations || currentValidation.observations.length === 0)
  ) {
    recommendations.push('✅ El documento está correctamente firmado y es válido. No se requiere ninguna acción adicional.');
  }

  return recommendations;
};

export const getValidationReport = async (
  documentId: string,
  _userId: string,
  _req: Request
): Promise<ValidationReportData> => {
  // 1. Obtener información básica del documento
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      documentType: true,
      signatures: {
        where: { isReverted: false },
        include: {
          signer: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 10,
      },
    },
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  // 2. Obtener validación actual del documento
  let currentValidation = null;
  try {
    const documentBuffer = await documentsService.getDocumentFileBuffer(documentId);
    const documentExtension = path.extname(document.fileName).substring(1).toLowerCase();
    const validationResponse = await firmaPeruService.validateSignature(
      documentBuffer,
      documentExtension
    );
    currentValidation = firmaPeruService.parseFirmaPeruValidationResponse(validationResponse);
  } catch (error) {
    console.error('Error al validar documento:', error);
    // Si falla la validación, continuamos sin ella
  }

  // 3. Obtener historial de validaciones (desde audit logs)
  const validationHistory: ValidationHistoryEntry[] = await prisma.auditLog.findMany({
    where: {
      entityType: 'Document',
      entityId: documentId,
      action: 'SIGNATURE_VERIFIED'
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  }).then((logs) =>
    logs.map((log) => {
      const newValue = log.newValue as any;
      return {
        id: log.id,
        validatedAt: log.createdAt.toISOString(),
        validatedBy: log.user?.username || 'Sistema',
        result: newValue?.result || 'DESCONOCIDO',
        signatures: newValue?.signatures || 0,
        validSignatures: newValue?.validSignatures || 0,
        observations: newValue?.observations || [],
      };
    })
  );

  // 4. Obtener información de los firmantes
  const signers: SignerInfo[] = document.signatures.map((sig) => ({
    id: sig.id,
    name: sig.signer?.username || 'Desconocido',
    email: sig.signer?.email,
    signedAt: sig.timestamp.toISOString(),
    certificateData: sig.certificateData,
  }));

  // 5. Obtener información de reversión
  const revertedSignature = await prisma.signature.findFirst({
    where: {
      documentId,
      isReverted: true,
    },
    orderBy: { revertedAt: 'desc' },
    include: {
      revertedByUser: {
        select: {
          username: true,
        },
      },
    },
  });

  const reversionInfo: ReversionInfo = {
    hasBeenReverted: !!revertedSignature,
    revertedAt: revertedSignature?.revertedAt?.toISOString(),
    revertedBy: revertedSignature?.revertedByUser?.username,
    reason: revertedSignature?.revertReason || undefined,
  };

  // 6. Compilar el reporte
  const reportData: ValidationReportData = {
    documentId: document.id,
    documentNumber: document.documentNumber,
    fileName: document.fileName,
    currentVersion: document.currentVersion,
    currentValidation,
    validationHistory,
    signers,
    reversionInfo,
    recommendations: [],
  };

  // 7. Generar recomendaciones
  reportData.recommendations = generateRecommendations(reportData);

  return reportData;
};

export default {
  getValidationReport,
};
