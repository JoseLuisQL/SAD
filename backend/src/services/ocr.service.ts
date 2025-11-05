import * as fs from 'fs';
import prisma from '../config/database';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('El archivo no existe');
    }

    console.log('[OCR] Iniciando extracción de texto del PDF...');

    const nativeText = await extractNativeText(filePath);
    console.log(`[OCR] Texto nativo extraído: ${nativeText.length} caracteres`);

    const hasSignificantText = nativeText.trim().length > 100;
    
    if (hasSignificantText) {
      console.log('[OCR] PDF contiene texto nativo extraíble');
      return nativeText;
    } else {
      console.log('[OCR] PDF escaneado o con poco texto nativo');
      console.log('[OCR] Nota: OCR de imágenes embebidas requiere procesamiento adicional');
      
      if (nativeText.trim().length > 0) {
        return nativeText + '\n\n[Nota: Este documento puede contener imágenes con texto que requieren OCR adicional]';
      }
      
      return '[Documento escaneado - Se requiere OCR para extraer el contenido]';
    }
  } catch (error) {
    console.error('[OCR] Error extrayendo texto del PDF:', error);
    throw error;
  }
};

const extractNativeText = async (filePath: string): Promise<string> => {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    
    const options = {
      max: 0,
      version: 'default'
    };
    
    const pdfData = await pdfParse(dataBuffer, options);
    
    const text = pdfData.text || '';
    const info = pdfData.info || {};
    const numpages = pdfData.numpages || 0;
    
    console.log(`[OCR] PDF Info: ${numpages} página(s)`);
    if (info.Title) {
      console.log(`[OCR] Título: ${info.Title}`);
    }
    
    return text;
  } catch (error) {
    console.warn('[OCR] No se pudo extraer texto nativo:', error);
    return '';
  }
};

export const processDocument = async (documentId: string): Promise<void> => {
  try {
    console.log(`[OCR] Iniciando procesamiento de documento ${documentId}`);

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { ocrStatus: 'PROCESSING' }
    });

    const text = await extractTextFromPDF(document.filePath);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrContent: text,
        ocrStatus: 'COMPLETED',
        ocrError: null
      }
    });

    console.log(`[OCR] Documento ${documentId} procesado exitosamente`);
  } catch (error) {
    console.error(`[OCR] Error procesando documento ${documentId}:`, error);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrStatus: 'ERROR',
        ocrError: error instanceof Error ? error.message : 'Error desconocido'
      }
    }).catch(err => {
      console.error('[OCR] Error actualizando estado de error:', err);
    });

    throw error;
  }
};

export const getOCRStatus = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      ocrStatus: true,
      ocrError: true,
      ocrContent: true
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  return {
    documentId: document.id,
    status: document.ocrStatus,
    error: document.ocrError,
    hasContent: !!document.ocrContent,
    contentLength: document.ocrContent?.length || 0
  };
};

export const reprocessDocument = async (documentId: string): Promise<void> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      ocrStatus: 'PENDING',
      ocrError: null
    }
  });

  const { queueService } = await import('./queue.service');
  await queueService.addToQueue(documentId);
};

export default {
  extractTextFromPDF,
  processDocument,
  getOCRStatus,
  reprocessDocument
};
