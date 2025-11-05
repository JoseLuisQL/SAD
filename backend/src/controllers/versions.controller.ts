import { Request, Response } from 'express';
import * as versionsService from '../services/versions.service';
import { uuidSchema } from '../utils/validators';

export const getVersions = async (req: Request, res: Response): Promise<void> => {
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

    const versions = await versionsService.getVersions(id);

    res.status(200).json({
      status: 'success',
      message: 'Versiones obtenidas correctamente',
      data: versions
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
      message: error instanceof Error ? error.message : 'Error al obtener versiones'
    });
  }
};

export const getVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { versionId } = req.params;

    const { error } = uuidSchema.validate(versionId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const version = await versionsService.getVersionById(versionId);

    res.status(200).json({
      status: 'success',
      message: 'Versión obtenida correctamente',
      data: version
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Versión no encontrada') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener versión'
    });
  }
};

export const restoreVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, versionId } = req.params;

    const idValidation = uuidSchema.validate(id);
    if (idValidation.error) {
      res.status(400).json({
        status: 'error',
        message: idValidation.error.details[0].message
      });
      return;
    }

    const versionIdValidation = uuidSchema.validate(versionId);
    if (versionIdValidation.error) {
      res.status(400).json({
        status: 'error',
        message: versionIdValidation.error.details[0].message
      });
      return;
    }

    const newVersion = await versionsService.restoreVersion(
      id,
      versionId,
      req.user!.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Versión restaurada correctamente',
      data: newVersion
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Documento no encontrado' || 
          error.message === 'Versión no encontrada') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'La versión no pertenece a este documento') {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al restaurar versión'
    });
  }
};

export const downloadVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { versionId } = req.params;

    // Permitir IDs especiales que comienzan con "current-"
    const isCurrentVersion = versionId.startsWith('current-');
    
    if (!isCurrentVersion) {
      const { error } = uuidSchema.validate(versionId);
      if (error) {
        res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
        return;
      }
    }

    const fileData = await versionsService.downloadVersion(versionId, req);

    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);

    fileData.fileStream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Versión no encontrada') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'El archivo de la versión no existe') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al descargar versión'
    });
  }
};

export const compareVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      res.status(400).json({
        status: 'error',
        message: 'Se requieren los parámetros v1 y v2'
      });
      return;
    }

    // Permitir IDs especiales que comienzan con "current-"
    const isV1Current = (v1 as string).startsWith('current-');
    const isV2Current = (v2 as string).startsWith('current-');

    if (!isV1Current) {
      const v1Validation = uuidSchema.validate(v1);
      if (v1Validation.error) {
        res.status(400).json({
          status: 'error',
          message: `ID de versión 1 inválido: ${v1Validation.error.details[0].message}`
        });
        return;
      }
    }

    if (!isV2Current) {
      const v2Validation = uuidSchema.validate(v2);
      if (v2Validation.error) {
        res.status(400).json({
          status: 'error',
          message: `ID de versión 2 inválido: ${v2Validation.error.details[0].message}`
        });
        return;
      }
    }

    const comparison = await versionsService.compareVersions(
      v1 as string,
      v2 as string
    );

    res.status(200).json({
      status: 'success',
      message: 'Comparación realizada correctamente',
      data: comparison
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('no fueron encontradas') || 
          error.message.includes('documentos diferentes')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al comparar versiones'
    });
  }
};

export default {
  getVersions,
  getVersion,
  compareVersions,
  restoreVersion,
  downloadVersion
};
