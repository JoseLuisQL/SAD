import { Request, Response } from 'express';
import * as documentTypesService from '../services/document-types.service';
import { createDocumentTypeSchema, updateDocumentTypeSchema, uuidSchema } from '../utils/validators';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, isActive } = req.query;

    const filters = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const result = await documentTypesService.getAllDocumentTypes(filters);

    res.status(200).json({
      status: 'success',
      message: 'Tipos de documentos obtenidos correctamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener tipos de documentos'
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

    const documentType = await documentTypesService.getDocumentTypeById(id);

    res.status(200).json({
      status: 'success',
      message: 'Tipo de documento obtenido correctamente',
      data: documentType
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Tipo de documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener tipo de documento'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createDocumentTypeSchema.validate(req.body);
    
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

    const documentType = await documentTypesService.createDocumentType(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Tipo de documento creado correctamente',
      data: documentType
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear tipo de documento'
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

    const { error, value } = updateDocumentTypeSchema.validate(req.body);
    
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

    const documentType = await documentTypesService.updateDocumentType(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Tipo de documento actualizado correctamente',
      data: documentType
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Tipo de documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar tipo de documento'
    });
  }
};

export const deleteDocumentType = async (req: Request, res: Response): Promise<void> => {
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

    await documentTypesService.deleteDocumentType(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Tipo de documento no encontrado') {
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
      message: error instanceof Error ? error.message : 'Error al eliminar tipo de documento'
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

    const documentTypes = await documentTypesService.searchDocumentTypes(q);

    res.status(200).json({
      status: 'success',
      message: 'Búsqueda completada',
      data: documentTypes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al buscar tipos de documentos'
    });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await documentTypesService.getStats();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    });
  }
};

export const exportCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, isActive } = req.query;

    const filters = {
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const data = await documentTypesService.exportToCSV(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tipos-documento.csv');

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar CSV'
    });
  }
};

export const exportExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, isActive } = req.query;

    const filters = {
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const data = await documentTypesService.exportToExcel(filters);

    res.status(200).json({
      status: 'success',
      message: 'Datos preparados para exportar',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar Excel'
    });
  }
};

export const importCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Los datos son requeridos y deben ser un array'
      });
      return;
    }

    const result = await documentTypesService.importFromCSV(data, req);

    res.status(200).json({
      status: 'success',
      message: `Importación completada: ${result.success.length} exitosos, ${result.errors.length} errores`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al importar CSV'
    });
  }
};

export const importExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Los datos son requeridos y deben ser un array'
      });
      return;
    }

    const result = await documentTypesService.importFromExcel(data, req);

    res.status(200).json({
      status: 'success',
      message: `Importación completada: ${result.success.length} exitosos, ${result.errors.length} errores`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al importar Excel'
    });
  }
};

export const bulk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { operation, data } = req.body;

    if (!operation || !data) {
      res.status(400).json({
        status: 'error',
        message: 'La operación y los datos son requeridos'
      });
      return;
    }

    let result;

    switch (operation) {
      case 'create':
        result = await documentTypesService.bulkCreate(data, req);
        break;
      case 'update':
        result = await documentTypesService.bulkUpdate(data, req);
        break;
      case 'delete':
        result = await documentTypesService.bulkDelete(data, req);
        break;
      default:
        res.status(400).json({
          status: 'error',
          message: 'Operación no válida. Debe ser: create, update o delete'
        });
        return;
    }

    res.status(200).json({
      status: 'success',
      message: `Operación masiva completada: ${result.success.length} exitosos, ${result.errors.length} errores`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error en operación masiva'
    });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteDocumentType,
  search,
  getStats,
  exportCSV,
  exportExcel,
  importCSV,
  importExcel,
  bulk
};
