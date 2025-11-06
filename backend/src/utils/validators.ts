import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.base': 'El nombre de usuario debe ser texto',
      'string.empty': 'El nombre de usuario es requerido',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
      'any.required': 'El nombre de usuario es requerido'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido'
    }),
  
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'La contraseña debe ser texto',
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  
  firstName: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  lastName: Joi.string()
    .required()
    .messages({
      'string.base': 'El apellido debe ser texto',
      'string.empty': 'El apellido es requerido',
      'any.required': 'El apellido es requerido'
    }),
  
  roleId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del rol debe ser texto',
      'string.empty': 'El ID del rol es requerido',
      'string.guid': 'El ID del rol debe ser un UUID válido',
      'any.required': 'El ID del rol es requerido'
    })
});

export const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.email': 'El email debe ser válido'
    }),
  
  password: Joi.string()
    .min(8)
    .optional()
    .messages({
      'string.base': 'La contraseña debe ser texto',
      'string.min': 'La contraseña debe tener al menos 8 caracteres'
    }),
  
  firstName: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  lastName: Joi.string()
    .optional()
    .messages({
      'string.base': 'El apellido debe ser texto'
    }),
  
  roleId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.base': 'El ID del rol debe ser texto',
      'string.guid': 'El ID del rol debe ser un UUID válido'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const uuidSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.base': 'El ID debe ser texto',
    'string.empty': 'El ID es requerido',
    'string.guid': 'El ID debe ser un UUID válido',
    'any.required': 'El ID es requerido'
  });

export const createRoleSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    }),
  
  permissions: Joi.object()
    .required()
    .messages({
      'object.base': 'Los permisos deben ser un objeto JSON',
      'any.required': 'Los permisos son requeridos'
    })
});

export const updateRoleSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    }),
  
  permissions: Joi.object()
    .optional()
    .messages({
      'object.base': 'Los permisos deben ser un objeto JSON'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createOfficeSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    })
});

export const updateOfficeSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createDocumentTypeSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    })
});

export const updateDocumentTypeSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createPeriodSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .required()
    .messages({
      'number.base': 'El año debe ser un número',
      'number.integer': 'El año debe ser un número entero',
      'number.min': 'El año debe ser mayor o igual a 1900',
      'number.max': 'El año debe ser menor o igual a 2100',
      'any.required': 'El año es requerido'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    })
});

export const updatePeriodSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .optional()
    .messages({
      'number.base': 'El año debe ser un número',
      'number.integer': 'El año debe ser un número entero',
      'number.min': 'El año debe ser mayor o igual a 1900',
      'number.max': 'El año debe ser menor o igual a 2100'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createArchivadorSchema = Joi.object({
  code: Joi.string()
    .required()
    .messages({
      'string.base': 'El código debe ser texto',
      'string.empty': 'El código es requerido',
      'any.required': 'El código es requerido'
    }),
  
  name: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  periodId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del periodo debe ser texto',
      'string.empty': 'El ID del periodo es requerido',
      'string.guid': 'El ID del periodo debe ser un UUID válido',
      'any.required': 'El ID del periodo es requerido'
    }),
  
  physicalLocation: Joi.object({
    estante: Joi.string()
      .required()
      .messages({
        'string.base': 'El estante debe ser texto',
        'string.empty': 'El estante es requerido',
        'any.required': 'El estante es requerido'
      }),
    
    modulo: Joi.string()
      .required()
      .messages({
        'string.base': 'El módulo debe ser texto',
        'string.empty': 'El módulo es requerido',
        'any.required': 'El módulo es requerido'
      }),
    
    descripcion: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': 'La descripción debe ser texto'
      })
  })
    .required()
    .messages({
      'object.base': 'La ubicación física debe ser un objeto',
      'any.required': 'La ubicación física es requerida'
    })
});

export const updateArchivadorSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  periodId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.base': 'El ID del periodo debe ser texto',
      'string.guid': 'El ID del periodo debe ser un UUID válido'
    }),
  
  physicalLocation: Joi.object({
    estante: Joi.string()
      .required()
      .messages({
        'string.base': 'El estante debe ser texto',
        'string.empty': 'El estante es requerido',
        'any.required': 'El estante es requerido'
      }),
    
    modulo: Joi.string()
      .required()
      .messages({
        'string.base': 'El módulo debe ser texto',
        'string.empty': 'El módulo es requerido',
        'any.required': 'El módulo es requerido'
      }),
    
    descripcion: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': 'La descripción debe ser texto'
      })
  })
    .optional()
    .messages({
      'object.base': 'La ubicación física debe ser un objeto'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createDocumentSchema = Joi.object({
  archivadorId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del archivador debe ser texto',
      'string.empty': 'El ID del archivador es requerido',
      'string.guid': 'El ID del archivador debe ser un UUID válido',
      'any.required': 'El ID del archivador es requerido'
    }),
  
  documentTypeId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del tipo de documento debe ser texto',
      'string.empty': 'El ID del tipo de documento es requerido',
      'string.guid': 'El ID del tipo de documento debe ser un UUID válido',
      'any.required': 'El ID del tipo de documento es requerido'
    }),
  
  officeId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID de la oficina debe ser texto',
      'string.empty': 'El ID de la oficina es requerido',
      'string.guid': 'El ID de la oficina debe ser un UUID válido',
      'any.required': 'El ID de la oficina es requerido'
    }),
  
  documentNumber: Joi.string()
    .required()
    .messages({
      'string.base': 'El número de documento debe ser texto',
      'string.empty': 'El número de documento es requerido',
      'any.required': 'El número de documento es requerido'
    }),
  
  documentDate: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha del documento debe ser una fecha válida',
      'any.required': 'La fecha del documento es requerida'
    }),
  
  sender: Joi.string()
    .required()
    .messages({
      'string.base': 'El remitente debe ser texto',
      'string.empty': 'El remitente es requerido',
      'any.required': 'El remitente es requerido'
    }),
  
  folioCount: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'El número de folios debe ser un número',
      'number.integer': 'El número de folios debe ser un número entero',
      'number.min': 'El número de folios debe ser al menos 1',
      'any.required': 'El número de folios es requerido'
    }),
  
  annotations: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Las anotaciones deben ser texto'
    })
});

export const updateDocumentSchema = Joi.object({
  archivadorId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.base': 'El ID del archivador debe ser texto',
      'string.guid': 'El ID del archivador debe ser un UUID válido'
    }),
  
  documentTypeId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.base': 'El ID del tipo de documento debe ser texto',
      'string.guid': 'El ID del tipo de documento debe ser un UUID válido'
    }),
  
  officeId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.base': 'El ID de la oficina debe ser texto',
      'string.guid': 'El ID de la oficina debe ser un UUID válido'
    }),
  
  documentNumber: Joi.string()
    .optional()
    .messages({
      'string.base': 'El número de documento debe ser texto'
    }),
  
  documentDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'La fecha del documento debe ser una fecha válida'
    }),
  
  sender: Joi.string()
    .optional()
    .messages({
      'string.base': 'El remitente debe ser texto'
    }),
  
  folioCount: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'El número de folios debe ser un número',
      'number.integer': 'El número de folios debe ser un número entero',
      'number.min': 'El número de folios debe ser al menos 1'
    }),
  
  annotations: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Las anotaciones deben ser texto'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const createExpedienteSchema = Joi.object({
  code: Joi.string()
    .required()
    .messages({
      'string.base': 'El código debe ser texto',
      'string.empty': 'El código es requerido',
      'any.required': 'El código es requerido'
    }),
  
  name: Joi.string()
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'any.required': 'El nombre es requerido'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    })
});

export const updateExpedienteSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto'
    }),
  
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La descripción debe ser texto'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const addRemoveDocumentsSchema = Joi.object({
  documentIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      'array.base': 'Los IDs de documentos deben ser un array',
      'array.min': 'Debe proporcionar al menos un documento',
      'string.guid': 'Cada ID de documento debe ser un UUID válido',
      'any.required': 'Los IDs de documentos son requeridos'
    })
});

export const createSignatureFlowSchema = Joi.object({
  documentId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del documento debe ser texto',
      'string.empty': 'El ID del documento es requerido',
      'string.guid': 'El ID del documento debe ser un UUID válido',
      'any.required': 'El ID del documento es requerido'
    }),
  
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  signers: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.base': 'El ID del usuario debe ser texto',
            'string.empty': 'El ID del usuario es requerido',
            'string.guid': 'El ID del usuario debe ser un UUID válido',
            'any.required': 'El ID del usuario es requerido'
          }),
        
        order: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'El orden debe ser un número',
            'number.integer': 'El orden debe ser un número entero',
            'number.min': 'El orden debe ser mayor o igual a 0',
            'any.required': 'El orden es requerido'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Los firmantes deben ser un array',
      'array.min': 'Debe proporcionar al menos un firmante',
      'any.required': 'Los firmantes son requeridos'
    })
});

export const updateSystemConfigSchema = Joi.object({
  companyName: Joi.string()
    .min(3)
    .max(255)
    .optional()
    .messages({
      'string.base': 'El nombre de la compañía debe ser texto',
      'string.min': 'El nombre de la compañía debe tener al menos 3 caracteres',
      'string.max': 'El nombre de la compañía no puede exceder 255 caracteres'
    }),
  
  companyTagline: Joi.string()
    .max(255)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El eslogan debe ser texto',
      'string.max': 'El eslogan no puede exceder 255 caracteres'
    }),
  
  companyEmail: Joi.string()
    .email()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.email': 'El email de la compañía debe ser válido'
    }),
  
  contactPhone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El teléfono debe ser texto',
      'string.pattern.base': 'El teléfono de contacto debe ser válido'
    }),
  
  supportEmail: Joi.string()
    .email()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.email': 'El email de soporte debe ser válido'
    }),
  
  websiteUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'La URL debe ser texto',
      'string.uri': 'La URL del sitio web debe ser válida'
    }),
  
  primaryColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El color debe ser texto',
      'string.pattern.base': 'El color primario debe ser un código hexadecimal válido (ej: #FF5733)'
    }),
  
  accentColor: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'El color debe ser texto',
      'string.pattern.base': 'El color de acento debe ser un código hexadecimal válido (ej: #FF5733)'
    }),
  
  signatureStampEnabled: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'El campo de estampado debe ser verdadero o falso'
    }),
  
  maintenanceMode: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'El modo de mantenimiento debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

export const brandAssetTypeSchema = Joi.string()
  .valid('logo', 'stamp')
  .required()
  .messages({
    'string.base': 'El tipo de activo debe ser texto',
    'any.only': 'El tipo de activo debe ser "logo" o "stamp"',
    'any.required': 'El tipo de activo es requerido'
  });

export const updateExternalImageUrlsSchema = Joi.object({
  logoUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'La URL del logo debe ser texto',
      'string.uri': 'La URL del logo debe ser válida'
    }),
  
  faviconUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'La URL del favicon debe ser texto',
      'string.uri': 'La URL del favicon debe ser válida'
    }),
  
  stampUrl: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'La URL del sello debe ser texto',
      'string.uri': 'La URL del sello debe ser válida'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos una URL para actualizar'
});
