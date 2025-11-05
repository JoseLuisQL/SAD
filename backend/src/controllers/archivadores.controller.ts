import { Request, Response } from 'express';
import * as archivadoresService from '../services/archivadores.service';
import { createArchivadorSchema, updateArchivadorSchema, uuidSchema } from '../utils/validators';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodId, search, page, limit } = req.query;

    const filters = {
      periodId: periodId as string,
      search: search as string
    };

    const pagination = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await archivadoresService.getAllArchivadores(filters, pagination);

    res.status(200).json({
      status: 'success',
      message: 'Archivadores obtenidos correctamente',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener archivadores'
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

    const archivador = await archivadoresService.getArchivadorById(id);

    res.status(200).json({
      status: 'success',
      message: 'Archivador obtenido correctamente',
      data: archivador
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Archivador no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener archivador'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createArchivadorSchema.validate(req.body);
    
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

    const archivador = await archivadoresService.createArchivador(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Archivador creado correctamente',
      data: archivador
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ya existe')) {
        res.status(409).json({
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
      message: error instanceof Error ? error.message : 'Error al crear archivador'
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

    const { error, value } = updateArchivadorSchema.validate(req.body);
    
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

    const archivador = await archivadoresService.updateArchivador(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Archivador actualizado correctamente',
      data: archivador
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Archivador no encontrado') {
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
      message: error instanceof Error ? error.message : 'Error al actualizar archivador'
    });
  }
};

export const deleteArchivador = async (req: Request, res: Response): Promise<void> => {
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

    await archivadoresService.deleteArchivador(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Archivador no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('tiene documentos asociados')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar archivador'
    });
  }
};

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'El parámetro de búsqueda "q" es requerido'
      });
      return;
    }

    const archivadores = await archivadoresService.searchArchivadores(q);

    res.status(200).json({
      status: 'success',
      message: 'Búsqueda realizada correctamente',
      data: archivadores
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al buscar archivadores'
    });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
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

    const stats = await archivadoresService.getArchivadorStats(id);

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Archivador no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    });
  }
};

export const getGeneralStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await archivadoresService.getArchivadoresGeneralStats();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas generales obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas generales'
    });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
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

    const analytics = await archivadoresService.getArchivadorAnalytics(id);

    res.status(200).json({
      status: 'success',
      message: 'Analytics obtenidos correctamente',
      data: analytics
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Archivador no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener analytics'
    });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteArchivador,
  search,
  getStats,
  getGeneralStats,
  getAnalytics
};
