import { Request, Response } from 'express';
import * as periodsService from '../services/periods.service';
import { createPeriodSchema, updatePeriodSchema, uuidSchema } from '../utils/validators';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const periods = await periodsService.getAllPeriods();

    res.status(200).json({
      status: 'success',
      message: 'Periodos obtenidos correctamente',
      data: periods
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener periodos'
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

    const period = await periodsService.getPeriodById(id);

    res.status(200).json({
      status: 'success',
      message: 'Periodo obtenido correctamente',
      data: period
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Periodo no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener periodo'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createPeriodSchema.validate(req.body);
    
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

    const period = await periodsService.createPeriod(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Periodo creado correctamente',
      data: period
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ya existe')) {
      res.status(409).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear periodo'
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

    const { error, value } = updatePeriodSchema.validate(req.body);
    
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

    const period = await periodsService.updatePeriod(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Periodo actualizado correctamente',
      data: period
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Periodo no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

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
      message: error instanceof Error ? error.message : 'Error al actualizar periodo'
    });
  }
};

export const deletePeriod = async (req: Request, res: Response): Promise<void> => {
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

    await periodsService.deletePeriod(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Periodo no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('tiene archivadores asociados')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar periodo'
    });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await periodsService.getStats();

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

export const exportCSV = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await periodsService.exportToCSV();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=periodos.csv');

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

export const exportExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await periodsService.exportToExcel();

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

    const result = await periodsService.importFromCSV(data, req);

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

    const result = await periodsService.importFromExcel(data, req);

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
        result = await periodsService.bulkCreate(data, req);
        break;
      case 'update':
        result = await periodsService.bulkUpdate(data, req);
        break;
      case 'delete':
        result = await periodsService.bulkDelete(data, req);
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
  deletePeriod,
  getStats,
  exportCSV,
  exportExcel,
  importCSV,
  importExcel,
  bulk
};
