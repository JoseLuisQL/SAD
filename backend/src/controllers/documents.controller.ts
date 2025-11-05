import { Request, Response } from 'express';
import * as documentsService from '../services/documents.service';
import * as ocrService from '../services/ocr.service';
import prisma from '../config/database';
import { createDocumentSchema, updateDocumentSchema, uuidSchema } from '../utils/validators';

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const { error, value } = createDocumentSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        status: 'error',
        message: 'Error de validación',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }

    const document = await documentsService.createDocument(req.file, value, req);

    res.status(201).json({
      status: 'success',
      message: 'Documento subido correctamente',
      data: document
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no existe')) {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no es un PDF válido')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al subir documento'
    });
  }
};

export const uploadBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionaron archivos'
      });
      return;
    }

    const commonMetadata = {
      archivadorId: req.body.archivadorId,
      documentTypeId: req.body.documentTypeId,
      officeId: req.body.officeId
    };

    if (!commonMetadata.archivadorId) {
      res.status(400).json({
        status: 'error',
        message: 'Falta el archivadorId en los metadatos comunes'
      });
      return;
    }

    let specificMetadata: any[];
    try {
      specificMetadata = JSON.parse(req.body.specificMetadata);
      
      if (!Array.isArray(specificMetadata)) {
        throw new Error('specificMetadata debe ser un array');
      }
    } catch (parseError) {
      res.status(400).json({
        status: 'error',
        message: 'El campo specificMetadata debe ser un JSON array válido'
      });
      return;
    }

    const result = await documentsService.createDocumentsBatch(
      req.files,
      commonMetadata,
      specificMetadata,
      req
    );

    res.status(201).json({
      status: 'success',
      message: `Proceso completado. ${result.successful} exitosos, ${result.failed} fallidos`,
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no coincide')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no existe')) {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al subir documentos'
    });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { archivadorId, documentTypeId, officeId, dateFrom, dateTo, search, signatureStatus, page, limit } = req.query;

    const filters = {
      archivadorId: archivadorId as string,
      documentTypeId: documentTypeId as string,
      officeId: officeId as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      search: search as string,
      signatureStatus: signatureStatus as string
    };

    const pagination = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await documentsService.getAllDocuments(filters, pagination);

    res.status(200).json({
      status: 'success',
      message: 'Documentos obtenidos correctamente',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener documentos'
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const document = await documentsService.getDocumentById(id);

    res.status(200).json({
      status: 'success',
      message: 'Documento obtenido correctamente',
      data: document
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener documento'
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const idValidation = uuidSchema.validate(id);
    if (idValidation.error) {
      res.status(400).json({
        status: 'error',
        message: idValidation.error.details[0].message
      });
      return;
    }

    const { error, value } = updateDocumentSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        status: 'error',
        message: 'Error de validación',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }

    const document = await documentsService.updateDocument(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Documento actualizado correctamente',
      data: document
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no existe')) {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar documento'
    });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    await documentsService.deleteDocument(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar documento'
    });
  }
};

export const download = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const fileData = await documentsService.downloadDocument(id, req);

    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);

    fileData.fileStream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'El archivo físico no existe') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al descargar documento'
    });
  }
};

export const getOCRStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const status = await ocrService.getOCRStatus(id);

    res.status(200).json({
      status: 'success',
      message: 'Estado de OCR obtenido correctamente',
      data: status
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estado de OCR'
    });
  }
};

export const reprocessOCR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    await ocrService.reprocessDocument(id);

    res.status(200).json({
      status: 'success',
      message: 'Documento agregado a la cola de procesamiento OCR'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al reprocesar OCR'
    });
  }
};

export const getSignatures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      res.status(404).json({
        status: 'error',
        message: 'Documento no encontrado'
      });
      return;
    }

    const signatures = await prisma.signature.findMany({
      where: { documentId: id },
      include: {
        signer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        revertedByUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        version: {
          select: {
            id: true,
            versionNumber: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Transformar para frontend
    const transformedSignatures = signatures.map(sig => ({
      ...sig,
      signer: {
        ...sig.signer,
        fullName: `${sig.signer.firstName} ${sig.signer.lastName}`
      },
      revertedByUser: sig.revertedByUser ? {
        ...sig.revertedByUser,
        fullName: `${sig.revertedByUser.firstName} ${sig.revertedByUser.lastName}`
      } : undefined,
      observations: sig.observations ? JSON.parse(sig.observations as string) : []
    }));

    res.status(200).json({
      status: 'success',
      message: 'Firmas obtenidas correctamente',
      data: transformedSignatures
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener firmas'
    });
  }
};

export const getIngestStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await documentsService.getIngestStats();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas de ingesta obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    });
  }
};

export const validateUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { archivadorId, documentTypeId, officeId, documentNumber, documentDate } = req.body;

    if (!archivadorId || !documentTypeId || !officeId || !documentNumber || !documentDate) {
      res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos para la validación'
      });
      return;
    }

    const validation = await documentsService.validateDocumentBeforeUpload({
      archivadorId,
      documentTypeId,
      officeId,
      documentNumber,
      documentDate: new Date(documentDate)
    });

    res.status(200).json({
      status: 'success',
      message: 'Validación completada',
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al validar documento'
    });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, archivadorId, documentTypeId, officeId } = req.query;

    const filters: any = {};
    
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom as string);
    }
    
    if (dateTo) {
      filters.dateTo = new Date(dateTo as string);
    }
    
    if (archivadorId) {
      filters.archivadorId = archivadorId as string;
    }
    
    if (documentTypeId) {
      filters.documentTypeId = documentTypeId as string;
    }
    
    if (officeId) {
      filters.officeId = officeId as string;
    }

    const analytics = await documentsService.getDocumentsAnalytics(filters);

    res.status(200).json({
      status: 'success',
      message: 'Analytics obtenidos correctamente',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener analytics'
    });
  }
};

export const getTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    
    if (error) {
      res.status(400).json({
        status: 'error',
        message: 'ID de documento inválido'
      });
      return;
    }

    const timeline = await documentsService.getDocumentTimeline(id);

    res.status(200).json({
      status: 'success',
      message: 'Timeline obtenido correctamente',
      data: timeline
    });
  } catch (error) {
    console.error('Error en getTimeline:', error);
    
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener timeline',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let period = undefined;
    if (startDate && endDate) {
      period = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };
    }

    const analyticsService = await import('../services/analytics.service');
    const metrics = await analyticsService.getDocumentMetrics(period);

    res.status(200).json({
      status: 'success',
      message: 'Métricas de documentos obtenidas correctamente',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener métricas de documentos'
    });
  }
};

export default {
  upload,
  uploadBatch,
  getAll,
  getById,
  update,
  deleteDocument,
  download,
  getOCRStatus,
  reprocessOCR,
  getSignatures,
  getIngestStats,
  validateUpload,
  getAnalytics,
  getTimeline,
  getMetrics
};
