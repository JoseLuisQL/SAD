import { Request, Response } from 'express';
import * as usersService from '../services/users.service';
import { createUserSchema, updateUserSchema, uuidSchema } from '../utils/validators';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, roleId, isActive } = req.query;

    const filters = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      search: search as string,
      roleId: roleId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const result = await usersService.getAllUsers(filters);

    res.status(200).json({
      status: 'success',
      message: 'Usuarios obtenidos correctamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener usuarios'
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

    const user = await usersService.getUserById(id);

    res.status(200).json({
      status: 'success',
      message: 'Usuario obtenido correctamente',
      data: user
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener usuario'
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    
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

    const user = await usersService.createUser(value, req);

    res.status(201).json({
      status: 'success',
      message: 'Usuario creado correctamente',
      data: user
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ya está en uso')) {
        res.status(409).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'El rol especificado no existe') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al crear usuario'
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

    const { error, value } = updateUserSchema.validate(req.body);
    
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

    const user = await usersService.updateUser(id, value, req);

    res.status(200).json({
      status: 'success',
      message: 'Usuario actualizado correctamente',
      data: user
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('ya está en uso')) {
        res.status(409).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'El rol especificado no existe') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar usuario'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
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

    await usersService.deleteUser(id, req);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'No puedes eliminar tu propia cuenta') {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar usuario'
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

    const users = await usersService.searchUsers(q);

    res.status(200).json({
      status: 'success',
      message: 'Búsqueda completada',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al buscar usuarios'
    });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await usersService.getUsersStats();

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
    const { search, roleId, isActive } = req.query;

    const filters = {
      search: search as string,
      roleId: roleId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const csv = await usersService.exportUsersToCSV(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar usuarios a CSV'
    });
  }
};

export const exportExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, roleId, isActive } = req.query;

    const filters = {
      search: search as string,
      roleId: roleId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const buffer = await usersService.exportUsersToExcel(filters);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar usuarios a Excel'
    });
  }
};

export const updateOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { completedTours, skippedTours } = req.body;

    if (!Array.isArray(completedTours) || !Array.isArray(skippedTours)) {
      res.status(400).json({
        status: 'error',
        message: 'completedTours y skippedTours deben ser arrays'
      });
      return;
    }

    const result = await usersService.updateOnboarding(userId, {
      completedTours,
      skippedTours
    }, req);

    res.status(200).json({
      status: 'success',
      message: 'Estado de onboarding actualizado',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar onboarding'
    });
  }
};

export const getOnboardingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const status = await usersService.getOnboardingStatus(userId);

    res.status(200).json({
      status: 'success',
      message: 'Estado de onboarding obtenido',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estado de onboarding'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const profile = await usersService.getProfile(userId);

    res.status(200).json({
      status: 'success',
      message: 'Perfil obtenido correctamente',
      data: profile
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener perfil'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { firstName, lastName, email } = req.body;

    const profile = await usersService.updateProfile(userId, {
      firstName,
      lastName,
      email
    }, req);

    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      data: profile
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('ya está en uso')) {
        res.status(409).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar perfil'
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        status: 'error',
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    const result = await usersService.changePassword(userId, {
      currentPassword,
      newPassword
    }, req);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'La contraseña actual es incorrecta') {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al cambiar contraseña'
    });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteUser,
  search,
  getStats,
  exportCSV,
  exportExcel,
  updateOnboarding,
  getOnboardingStatus,
  getProfile,
  updateProfile,
  changePassword
};
