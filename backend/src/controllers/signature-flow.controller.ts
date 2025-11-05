import { Request, Response } from 'express';
import * as signatureFlowService from '../services/signature-flow.service';
import * as fs from 'fs';
import * as path from 'path';
import { uuidSchema } from '../utils/validators';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, name, signers } = req.body;

    if (!documentId || !name || !signers) {
      res.status(400).json({
        status: 'error',
        message: 'Los campos documentId, name y signers son obligatorios'
      });
      return;
    }

    if (!Array.isArray(signers) || signers.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'El campo signers debe ser un array con al menos un elemento'
      });
      return;
    }

    for (const signer of signers) {
      if (!signer.userId || typeof signer.order !== 'number') {
        res.status(400).json({
          status: 'error',
          message: 'Cada elemento de signers debe tener userId (string) y order (number)'
        });
        return;
      }
    }

    const flow = await signatureFlowService.createSignatureFlow({
      documentId,
      name,
      signers,
      createdById: req.user!.id,
      req
    });

    res.status(201).json({
      status: 'success',
      message: 'Flujo de firma creado correctamente',
      data: flow
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

      if (error.message.includes('no existen')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear flujo de firma'
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

    const flow = await signatureFlowService.getSignatureFlowById(id);

    res.status(200).json({
      status: 'success',
      message: 'Flujo de firma obtenido correctamente',
      data: flow
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Flujo de firma no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener flujo de firma'
    });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      documentId,
      status,
      signerId,
      documentTypeId,
      createdById,
      dateFrom,
      dateTo,
      page,
      limit
    } = req.query;

    const filters = {
      documentId: documentId as string,
      status: status as string,
      signerId: signerId as string,
      documentTypeId: documentTypeId as string,
      createdById: createdById as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    };

    const result = await signatureFlowService.getAllSignatureFlows(filters);

    res.status(200).json({
      status: 'success',
      message: 'Flujos de firma obtenidos correctamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener flujos de firma'
    });
  }
};

export const advance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: flowId } = req.params;

    const { error } = uuidSchema.validate(flowId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo firmado'
      });
      return;
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

    if (!['pdf', 'xml', 'p7s'].includes(fileExtension)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(400).json({
        status: 'error',
        message: 'El archivo debe ser PDF, XML o P7S'
      });
      return;
    }

    const signedDocumentBuffer = fs.readFileSync(file.path);

    const updatedFlow = await signatureFlowService.advanceSignatureFlow({
      flowId,
      signedDocumentBuffer,
      signerId: req.user!.id,
      documentExtension: fileExtension,
      req
    });

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      status: 'success',
      message: 'Flujo de firma avanzado correctamente',
      data: updatedFlow
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof Error) {
      if (error.message === 'Flujo de firma no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('ya ha sido completado') || 
          error.message.includes('ha sido cancelado') ||
          error.message.includes('No es tu turno')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al avanzar flujo de firma'
    });
  }
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: flowId } = req.params;

    const { error } = uuidSchema.validate(flowId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const updatedFlow = await signatureFlowService.cancelSignatureFlow(
      flowId,
      req.user!.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Flujo de firma cancelado correctamente',
      data: updatedFlow
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Flujo de firma no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No tienes permisos') || 
          error.message.includes('ya está cancelado') ||
          error.message.includes('No se puede cancelar')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al cancelar flujo de firma'
    });
  }
};

export const getPending = async (req: Request, res: Response): Promise<void> => {
  try {
    const flows = await signatureFlowService.getPendingSignatureFlows(req.user!.id);

    res.status(200).json({
      status: 'success',
      message: 'Flujos pendientes obtenidos correctamente',
      data: flows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener flujos pendientes'
    });
  }
};
