export const PERMISSION_MODULES = {
  // Administración
  users: {
    label: 'Usuarios',
    category: 'Administración',
    actions: ['view', 'create', 'update', 'delete']
  },
  roles: {
    label: 'Roles y Permisos',
    category: 'Administración',
    actions: ['view', 'create', 'update', 'delete']
  },
  offices: {
    label: 'Oficinas',
    category: 'Administración',
    actions: ['view', 'create', 'update', 'delete']
  },
  documentTypes: {
    label: 'Tipos de Documento',
    category: 'Administración',
    actions: ['view', 'create', 'update', 'delete']
  },
  periods: {
    label: 'Periodos',
    category: 'Administración',
    actions: ['view', 'create', 'update', 'delete']
  },
  audit: {
    label: 'Auditoría',
    category: 'Administración',
    actions: ['view', 'export']
  },
  configuration: {
    label: 'Configuración del Sistema',
    category: 'Administración',
    actions: ['view', 'update']
  },
  
  // Archivo Digital
  archivadores: {
    label: 'Archivadores',
    category: 'Archivo Digital',
    actions: ['view', 'create', 'update', 'delete']
  },
  documents: {
    label: 'Documentos',
    category: 'Archivo Digital',
    actions: ['view', 'create', 'update', 'delete', 'download', 'export']
  },
  versions: {
    label: 'Versiones de Documentos',
    category: 'Archivo Digital',
    actions: ['view', 'restore', 'download', 'compare']
  },
  expedientes: {
    label: 'Expedientes',
    category: 'Archivo Digital',
    actions: ['view', 'create', 'update', 'delete']
  },
  
  // Consultas y Reportes
  search: {
    label: 'Búsqueda de Documentos',
    category: 'Consultas y Reportes',
    actions: ['view', 'export']
  },
  reports: {
    label: 'Reportes',
    category: 'Consultas y Reportes',
    actions: ['view', 'generate', 'export']
  },
  analytics: {
    label: 'Analytics y Métricas',
    category: 'Consultas y Reportes',
    actions: ['view', 'export']
  },
  
  // Firma Digital
  signing: {
    label: 'Firmar Documentos',
    category: 'Firma Digital',
    actions: ['view', 'sign']
  },
  signatureFlows: {
    label: 'Flujos de Firma',
    category: 'Firma Digital',
    actions: ['view', 'create', 'update', 'delete', 'approve']
  },
  
  // Notificaciones
  notifications: {
    label: 'Notificaciones',
    category: 'Sistema',
    actions: ['view', 'delete']
  },
  
  // Seguridad
  security: {
    label: 'Copias de Seguridad',
    category: 'Seguridad',
    actions: ['backup.view', 'backup.manage', 'backup.restore']
  }
} as const;

export const ACTION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
  download: 'Descargar',
  export: 'Exportar',
  generate: 'Generar',
  sign: 'Firmar',
  approve: 'Aprobar',
  restore: 'Restaurar',
  compare: 'Comparar',
  'backup.view': 'Ver Copias',
  'backup.manage': 'Gestionar Copias',
  'backup.restore': 'Restaurar Sistema'
};

export const DEFAULT_PERMISSIONS: Record<string, Record<string, any>> = {
  Administrador: {
    users: { view: true, create: true, update: true, delete: true },
    roles: { view: true, create: true, update: true, delete: true },
    offices: { view: true, create: true, update: true, delete: true },
    documentTypes: { view: true, create: true, update: true, delete: true },
    periods: { view: true, create: true, update: true, delete: true },
    audit: { view: true, export: true },
    configuration: { view: true, update: true },
    archivadores: { view: true, create: true, update: true, delete: true },
    documents: { view: true, create: true, update: true, delete: true, download: true, export: true },
    versions: { view: true, restore: true, download: true, compare: true },
    expedientes: { view: true, create: true, update: true, delete: true },
    search: { view: true, export: true },
    reports: { view: true, generate: true, export: true },
    analytics: { view: true, export: true },
    signing: { view: true, sign: true },
    signatureFlows: { view: true, create: true, update: true, delete: true, approve: true },
    notifications: { view: true, delete: true },
    security: { 'backup.view': true, 'backup.manage': true, 'backup.restore': true }
  },
  
  Operador: {
    users: { view: true },
    offices: { view: true },
    documentTypes: { view: true },
    periods: { view: true },
    configuration: { view: true },
    archivadores: { view: true, create: true, update: true },
    documents: { view: true, create: true, update: true, download: true, export: true },
    versions: { view: true, download: true, compare: true },
    expedientes: { view: true, create: true, update: true },
    search: { view: true, export: true },
    reports: { view: true, generate: true, export: true },
    analytics: { view: true },
    signing: { view: true, sign: true },
    signatureFlows: { view: true },
    notifications: { view: true }
  },
  
  Consultor: {
    documents: { view: true, download: true },
    versions: { view: true, download: true },
    expedientes: { view: true },
    search: { view: true },
    reports: { view: true, generate: true, export: true },
    analytics: { view: true },
    notifications: { view: true }
  }
};

export const getModulesByCategory = () => {
  const grouped: Record<string, Array<{ key: string; label: string; actions: readonly string[] }>> = {};
  
  Object.entries(PERMISSION_MODULES).forEach(([key, module]) => {
    if (!grouped[module.category]) {
      grouped[module.category] = [];
    }
    grouped[module.category].push({ key, label: module.label, actions: module.actions });
  });
  
  return grouped;
};
