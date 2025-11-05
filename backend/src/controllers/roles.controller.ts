import { Request, Response } from 'express';
import * as rolesService from '../services/roles.service';
import { createRoleSchema, updateRoleSchema, uuidSchema } from '../utils/validators';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await rolesService.getAllRoles();

    res.status(200).json({
      status: 'success',
      message: 'Roles obtenidos correctamente',
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener roles'
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

    const role = await rolesService.getRoleById(id);

    res.status(200).json({
      status: 'success',
      message: 'Rol obtenido correctamente',
      data: role
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Rol no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener rol'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createRoleSchema.validate(req.body);
    
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

    const role = await rolesService.createRole(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Rol creado correctamente',
      data: role
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
      message: error instanceof Error ? error.message : 'Error al crear rol'
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

    const { error, value } = updateRoleSchema.validate(req.body);
    
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

    const role = await rolesService.updateRole(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Rol actualizado correctamente',
      data: role
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rol no encontrado') {
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
      message: error instanceof Error ? error.message : 'Error al actualizar rol'
    });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
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

    await rolesService.deleteRole(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rol no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('tiene usuarios asignados')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar rol'
    });
  }
};

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await rolesService.getRolesAnalytics();

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

export const getImpact = async (req: Request, res: Response): Promise<void> => {
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

    const impact = await rolesService.getRoleImpact(id);

    res.status(200).json({
      status: 'success',
      message: 'Impacto del rol obtenido correctamente',
      data: impact
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Rol no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener impacto'
    });
  }
};

export const duplicate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const idValidation = uuidSchema.validate(id);
    if (idValidation.error) {
      res.status(400).json({
        status: 'error',
        message: idValidation.error.details[0].message
      });
      return;
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({
        status: 'error',
        message: 'El nombre del nuevo rol es requerido'
      });
      return;
    }

    const duplicatedRole = await rolesService.duplicateRole(id, name.trim(), req);

    res.status(201).json({
      status: 'success',
      message: 'Rol duplicado correctamente',
      data: duplicatedRole
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rol no encontrado') {
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
      message: error instanceof Error ? error.message : 'Error al duplicar rol'
    });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteRole,
  getAnalytics,
  getImpact,
  duplicate
};
