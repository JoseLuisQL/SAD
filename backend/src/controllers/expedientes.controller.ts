import { Request, Response } from 'express';
import * as expedientesService from '../services/expedientes.service';
import { 
  createExpedienteSchema, 
  updateExpedienteSchema, 
  addRemoveDocumentsSchema,
  uuidSchema 
} from '../utils/validators';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query;

    const filters = {
      search: search as string
    };

    const pagination = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await expedientesService.getAllExpedientes(filters, pagination);

    res.status(200).json({
      status: 'success',
      message: 'Expedientes obtenidos correctamente',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener expedientes'
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

    const expediente = await expedientesService.getExpedienteById(id);

    res.status(200).json({
      status: 'success',
      message: 'Expediente obtenido correctamente',
      data: expediente
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener expediente'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createExpedienteSchema.validate(req.body);
    
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

    const expediente = await expedientesService.createExpediente(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Expediente creado correctamente',
      data: expediente
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
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear expediente'
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

    const { error, value } = updateExpedienteSchema.validate(req.body);
    
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

    const expediente = await expedientesService.updateExpediente(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Expediente actualizado correctamente',
      data: expediente
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar expediente'
    });
  }
};

export const deleteExpediente = async (req: Request, res: Response): Promise<void> => {
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

    await expedientesService.deleteExpediente(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Expediente no encontrado') {
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
      message: error instanceof Error ? error.message : 'Error al eliminar expediente'
    });
  }
};

export const addDocuments = async (req: Request, res: Response): Promise<void> => {
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

    const { error, value } = addRemoveDocumentsSchema.validate(req.body);
    
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

    const expediente = await expedientesService.addDocumentsToExpediente(
      id,
      value.documentIds,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Documentos agregados correctamente al expediente',
      data: expediente
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Expediente no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no existen') || error.message.includes('ya están asociados')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al agregar documentos al expediente'
    });
  }
};

export const removeDocuments = async (req: Request, res: Response): Promise<void> => {
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

    const { error, value } = addRemoveDocumentsSchema.validate(req.body);
    
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

    const expediente = await expedientesService.removeDocumentsFromExpediente(
      id,
      value.documentIds,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Documentos removidos correctamente del expediente',
      data: expediente
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Expediente no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no pertenecen')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al remover documentos del expediente'
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

    const expedientes = await expedientesService.searchExpedientes(q);

    res.status(200).json({
      status: 'success',
      message: 'Búsqueda realizada correctamente',
      data: expedientes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al buscar expedientes'
    });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await expedientesService.getExpedientesStats();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas de expedientes obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas de expedientes'
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

    const analytics = await expedientesService.getExpedienteAnalytics(id);

    res.status(200).json({
      status: 'success',
      message: 'Analytics del expediente obtenidos correctamente',
      data: analytics
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener analytics del expediente'
    });
  }
};

export const getActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const result = await expedientesService.getExpedienteActivity(id, pageNum, limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Actividad del expediente obtenida correctamente',
      data: result.activities,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener actividad del expediente'
    });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteExpediente,
  addDocuments,
  removeDocuments,
  search,
  getStats,
  getAnalytics,
  getActivity
};
