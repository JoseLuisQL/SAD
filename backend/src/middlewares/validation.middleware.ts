import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Generic validation middleware that can be used with any Joi schema
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      res.status(400).json({
        status: 'error',
        message: 'Errores de validación',
        errors
      });
      return;
    }

    next();
  };
};

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'El nombre de usuario es requerido',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
    'any.required': 'El nombre de usuario es requerido'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico es requerido',
    'string.email': 'Debe proporcionar un correo electrónico válido',
    'any.required': 'El correo electrónico es requerido'
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'La contraseña es requerida',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es requerida'
  }),
  firstName: Joi.string().required().messages({
    'string.empty': 'El nombre es requerido',
    'any.required': 'El nombre es requerido'
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'El apellido es requerido',
    'any.required': 'El apellido es requerido'
  }),
  roleId: Joi.string().uuid().required().messages({
    'string.empty': 'El rol es requerido',
    'string.guid': 'El ID del rol debe ser un UUID válido',
    'any.required': 'El rol es requerido'
  })
});

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'El nombre de usuario es requerido',
    'any.required': 'El nombre de usuario es requerido'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'El token de actualización es requerido',
    'any.required': 'El token de actualización es requerido'
  })
});

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    res.status(400).json({
      status: 'error',
      message: 'Errores de validación',
      errors
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    res.status(400).json({
      status: 'error',
      message: 'Errores de validación',
      errors
    });
    return;
  }

  next();
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = refreshTokenSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    res.status(400).json({
      status: 'error',
      message: 'Errores de validación',
      errors
    });
    return;
  }

  next();
};
