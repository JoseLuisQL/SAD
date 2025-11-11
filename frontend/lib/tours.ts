import type { CoachMarkTour } from '@/types/onboarding.types';

export const tours: Record<string, CoachMarkTour> = {
  // ============================================
  // SECCIÓN 1: PRINCIPAL - Dashboard
  // ============================================
  'general-tour': {
    id: 'general-tour',
    name: 'Bienvenida al Sistema de Archivos Digitales (SAD)',
    description: 'Conoce las funcionalidades principales del sistema y aprende a navegar por todas las secciones disponibles. Este tour te dará una visión general completa.',
    module: 'general',
    steps: [
      {
        id: 'general-welcome',
        target: '[data-tour="dashboard"]',
        title: '¡Bienvenido al Sistema Integrado de Archivos Digitales!',
        content: 'Este sistema te permite gestionar documentos, expedientes y archivadores de forma completamente digital, con trazabilidad completa, firma digital certificada y búsqueda avanzada. Mantén tus archivos organizados, seguros y accesibles desde cualquier lugar.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'general-menu',
        target: '[data-tour="sidebar"]',
        title: 'Menú de Navegación Principal',
        content: 'Desde el menú lateral puedes acceder a todas las secciones del sistema: Archivo Digital (documentos y expedientes), Consultas (búsqueda avanzada), Firma Digital, Reportes y Administración. Cada sección está organizada de forma intuitiva.',
        placement: 'right',
        highlightPadding: 10,
      },
      {
        id: 'general-search',
        target: '[data-tour="global-search"]',
        title: 'Búsqueda Global Rápida',
        content: 'Utiliza la búsqueda global para encontrar rápidamente cualquier documento, expediente o archivador en todo el sistema. Solo escribe y los resultados aparecerán al instante. Presiona Ctrl+K para acceder desde cualquier página.',
        placement: 'bottom',
        highlightPadding: 8,
      },
      {
        id: 'general-notifications',
        target: '[data-tour="notifications"]',
        title: 'Centro de Notificaciones',
        content: 'Recibe alertas importantes: documentos que requieren tu firma, cambios en expedientes, vencimientos y actividades relevantes. Las notificaciones urgentes aparecen resaltadas en rojo.',
        placement: 'bottom',
        highlightPadding: 8,
      },
      {
        id: 'general-help',
        target: '[data-tour="help-center"]',
        title: 'Centro de Ayuda Siempre Disponible',
        content: 'Accede al centro de ayuda en cualquier momento para ver guías detalladas, preguntas frecuentes, glosario de términos y volver a reproducir cualquier tutorial. ¡Estamos aquí para ayudarte!',
        placement: 'bottom',
        highlightPadding: 8,
      },
    ],
  },

  // ============================================
  // SECCIÓN 2: CONSULTAS - Búsqueda Avanzada
  // ============================================
  'busqueda-tour': {
    id: 'busqueda-tour',
    name: 'Búsqueda Avanzada de Documentos',
    description: 'Aprende a utilizar el sistema de búsqueda avanzada con filtros potentes para encontrar exactamente lo que necesitas en segundos.',
    module: 'busqueda',
    steps: [
      {
        id: 'busqueda-header',
        target: '[data-tour="search-header"]',
        title: '¡Bienvenido a la Búsqueda Avanzada!',
        content: 'Aquí puedes buscar documentos por texto completo, metadatos (número, remitente, oficina), contenido procesado con OCR y mucho más. Es la herramienta más potente para encontrar información en todo el sistema.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'busqueda-saved',
        target: '[data-tour="search-saved"]',
        title: 'Búsquedas Guardadas',
        content: 'Guarda tus búsquedas más frecuentes para aplicarlas con un solo clic. Perfecto para consultas recurrentes como "documentos del mes actual", "oficios pendientes de firma" o "expedientes por oficina". Ahorra tiempo y mantén consistencia.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'busqueda-search',
        target: '[data-tour="search-input"]',
        title: 'Barra de Búsqueda Principal',
        content: 'Escribe aquí tu consulta. El sistema busca en números de documento, remitentes, asuntos, contenido procesado con OCR y anotaciones. Puedes usar palabras clave simples o combinaciones. Presiona Enter o clic en Buscar para ver resultados.',
        placement: 'bottom',
        highlightPadding: 8,
      },
      {
        id: 'busqueda-filters',
        target: '[data-tour="search-filters-button"]',
        title: 'Filtros Avanzados para Búsqueda Precisa',
        content: 'Haz clic en este botón para abrir filtros avanzados y refinar tu búsqueda: tipo de documento (oficio, resolución, etc.), rango de fechas, oficina emisora, archivador, estado de firma y más. Combínalos para búsquedas ultra precisas.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'busqueda-results',
        target: '[data-tour="search-results-table"]',
        title: 'Tabla de Resultados',
        content: 'Todos los documentos que coinciden con tu búsqueda aparecen aquí ordenados por relevancia. Puedes ordenar por fecha, número o remitente haciendo clic en los encabezados de columna. Haz clic en cualquier documento para ver sus detalles completos.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  // ============================================
  // SECCIÓN 3: ARCHIVO DIGITAL
  // ============================================
  'archivadores-tour': {
    id: 'archivadores-tour',
    name: 'Gestión de Archivadores',
    description: 'Los archivadores son las unidades principales de organización que agrupan expedientes por período, área o tema. Aprende a crearlos y administrarlos eficientemente.',
    module: 'archivadores',
    steps: [
      {
        id: 'archivadores-welcome',
        target: '[data-tour="archivadores-create-button"]',
        title: '¡Bienvenido a la Gestión de Archivadores!',
        content: 'Los archivadores son las unidades de organización más grandes del sistema. Agrupan expedientes relacionados por período (ejemplo: "Archivo 2024"), área administrativa o tema. Comencemos: haz clic en este botón para crear tu primer archivador.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'archivadores-stats',
        target: '[data-tour="archivadores-stats"]',
        title: 'Métricas y Estadísticas en Tiempo Real',
        content: 'Visualiza métricas importantes de cada archivador: cantidad total de expedientes contenidos, número de documentos almacenados, estado de ocupación (capacidad) y última actualización. Estas estadísticas te ayudan a mantener el control.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'archivadores-search',
        target: '[data-tour="archivadores-search"]',
        title: 'Búsqueda y Filtros Inteligentes',
        content: 'Utiliza esta barra para buscar archivadores por código único o nombre descriptivo. Puedes expandir los filtros avanzados para refinar por período temporal, área administrativa u oficina responsable. La búsqueda es instantánea.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'archivadores-table',
        target: '[data-tour="archivadores-table"]',
        title: 'Tabla Completa de Archivadores',
        content: 'Aquí visualizas todos los archivadores disponibles con información detallada: código de identificación, nombre descriptivo, período de archivo, ubicación física (estante/anaquel), cantidad de expedientes contenidos y capacidad. Haz clic en cualquier archivador para gestionar sus expedientes.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'documentos-tour': {
    id: 'documentos-tour',
    name: 'Gestión de Documentos Digitales',
    description: 'Aprende a cargar, organizar, buscar y gestionar documentos digitales con procesamiento OCR automático y control de versiones completo.',
    module: 'documentos',
    steps: [
      {
        id: 'documentos-upload',
        target: '[data-tour="documentos-upload-button"]',
        title: '¡Bienvenido a la Gestión de Documentos!',
        content: 'Aquí gestionarás todos los documentos digitales del sistema: oficios, resoluciones, memorandos, actas y más. Puedes subir documentos de forma individual o en lote (múltiples archivos a la vez). El sistema acepta PDF, Word, imágenes y otros formatos comunes.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'documentos-stats',
        target: '[data-tour="documentos-stats"]',
        title: 'Panel de Estadísticas y Métricas',
        content: 'Visualiza métricas clave en tiempo real: total de documentos en el sistema, cantidad procesados con OCR (texto extraído), documentos firmados digitalmente, pendientes de firma y más. Estas estadísticas te ayudan a monitorear la salud y uso del sistema.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'documentos-search',
        target: '[data-tour="documentos-search"]',
        title: 'Búsqueda Rápida y Filtros Avanzados',
        content: 'Busca documentos por número de documento, remitente, asunto o contenido extraído con OCR. Usa los filtros avanzados para refinar por archivador, tipo de documento (oficio, resolución, etc.), oficina emisora, estado de firma y rango de fechas. Combina varios filtros para búsquedas precisas.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'documentos-table',
        target: '[data-tour="documentos-table"]',
        title: 'Tabla Completa de Documentos',
        content: 'Visualiza todos los documentos con información detallada: número único, tipo de documento, remitente, archivador/expediente asociado, fecha de creación y estado de firma (firmado/pendiente). Haz clic en cualquier documento para ver sus detalles completos, historial de versiones, firmas y contenido OCR.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'expedientes-tour': {
    id: 'expedientes-tour',
    name: 'Gestión de Expedientes',
    description: 'Los expedientes agrupan documentos relacionados con un mismo asunto administrativo o trámite. Aprende a crear expedientes, agregar documentos y gestionar folios.',
    module: 'expedientes',
    steps: [
      {
        id: 'expedientes-create',
        target: '[data-tour="expedientes-create-button"]',
        title: '¡Bienvenido a la Gestión de Expedientes!',
        content: 'Los expedientes agrupan documentos relacionados con un mismo asunto o trámite administrativo (ejemplo: expediente de contratación, expediente de compra, expediente judicial). Cada documento recibe un número de folio secuencial. Comencemos: haz clic aquí para crear tu primer expediente.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'expedientes-stats',
        target: '[data-tour="expedientes-stats"]',
        title: 'Métricas y Estadísticas de Expedientes',
        content: 'Visualiza estadísticas clave: total de expedientes creados, cantidad de documentos asociados (folios totales), expedientes por estado (abiertos/cerrados) y tendencias de crecimiento. Estas métricas te dan una visión general del sistema.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'expedientes-search',
        target: '[data-tour="expedientes-search"]',
        title: 'Búsqueda Inteligente de Expedientes',
        content: 'Busca expedientes por código único o nombre descriptivo. La búsqueda es instantánea y te permite encontrar rápidamente el expediente que necesitas. También puedes filtrar por archivador contenedor, oficina responsable o rango de fechas.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'expedientes-table',
        target: '[data-tour="expedientes-table"]',
        title: 'Tabla Completa de Expedientes',
        content: 'Visualiza todos los expedientes con información detallada: código único de identificación, nombre descriptivo, archivador al que pertenece, cantidad total de documentos (folios), fecha de creación y última modificación. Haz clic en cualquier expediente para ver sus documentos, agregar nuevos o modificar metadatos.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  // ============================================
  // SECCIÓN 4: FIRMA DIGITAL
  // ============================================

  'firma-firmar-tour': {
    id: 'firma-firmar-tour',
    name: 'Firmar Documentos Digitalmente',
    description: 'Aprende a firmar documentos digitalmente con tu certificado de Firma Perú. El asistente te guía paso a paso de forma simple y segura con validez legal.',
    module: 'firma',
    steps: [
      {
        id: 'firma-wizard-header',
        target: '[data-tour="firma-wizard-header"]',
        title: '¡Bienvenido al Asistente de Firma Digital!',
        content: 'Este asistente te guiará paso a paso para firmar documentos digitalmente con tu certificado de Firma Perú (emitido por RENIEC). Las firmas digitales tienen plena validez legal en Perú según Ley de Firmas y Certificados Digitales. Es un proceso simple, seguro y rápido.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-stepper',
        target: '[data-tour="firma-stepper"]',
        title: 'Pasos del Proceso de Firma',
        content: 'Sigue el progreso visual del proceso de firma: Paso 1) Selecciona el documento que deseas firmar, Paso 2) Revisa los detalles y requisitos técnicos, Paso 3) Firma con tu token USB. Puedes navegar entre pasos usando los botones Siguiente/Anterior.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'firma-search',
        target: '[data-tour="firma-search"]',
        title: 'Buscar y Seleccionar Documento',
        content: 'Busca el documento que deseas firmar por nombre de archivo, número de documento o remitente. Los resultados aparecen instantáneamente. Haz clic en cualquier documento de la lista para seleccionarlo y continuar al siguiente paso.',
        placement: 'bottom',
        highlightPadding: 8,
      },
      {
        id: 'firma-checklist',
        target: '[data-tour="firma-checklist"]',
        title: 'Checklist de Requisitos Técnicos',
        content: 'Antes de firmar, verifica que cumples todos los requisitos técnicos: ✓ Token USB de Firma Perú conectado al puerto USB, ✓ Drivers de token instalados correctamente, ✓ Certificado digital vigente (no vencido), ✓ Extensión EClickOnce launcher instalada en Chrome. Si falta algo, el sistema te alertará.',
        placement: 'left',
        highlightPadding: 10,
      },
    ],
  },

  'firma-flujos-tour': {
    id: 'firma-flujos-tour',
    name: 'Flujos de Firma Colaborativos',
    description: 'Crea y gestiona flujos de firma donde múltiples personas firman un documento en orden secuencial. Ideal para procesos de aprobación y autorizaciones multinivel.',
    module: 'firma',
    steps: [
      {
        id: 'firma-flujos-header',
        target: '[data-tour="firma-flujos-header"]',
        title: '¡Bienvenido a la Gestión de Flujos de Firma!',
        content: 'Los flujos de firma permiten que múltiples personas firmen un mismo documento en un orden específico y secuencial. Ideal para procesos de aprobación multinivel, autorizaciones jerárquicas o documentos que requieren múltiples validaciones. El sistema notifica automáticamente a cada firmante cuando es su turno.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-flujos-create',
        target: '[data-tour="firma-flujos-create"]',
        title: 'Crear un Nuevo Flujo de Firma',
        content: 'Haz clic aquí para crear un flujo de firma nuevo. Deberás: 1) Seleccionar el documento a firmar, 2) Agregar los firmantes en el orden deseado (arrástralos para reordenar), 3) Definir fechas límite opcionales. El primer firmante recibirá notificación inmediatamente.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'firma-flujos-stats',
        target: '[data-tour="firma-flujos-stats"]',
        title: 'Estadísticas y Estado de Flujos',
        content: 'Visualiza métricas importantes para monitorear el estado general: flujos totales creados, flujos en progreso (esperando firmas), flujos completados exitosamente y flujos cancelados o rechazados. Estas estadísticas te ayudan a identificar cuellos de botella.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-flujos-filters',
        target: '[data-tour="firma-flujos-filters"]',
        title: 'Filtros y Búsqueda de Flujos',
        content: 'Filtra flujos de firma por estado (pendiente, en progreso, completado, cancelado), rango de fechas de creación o firmantes específicos. Combina filtros para encontrar rápidamente el flujo que buscas. La búsqueda es instantánea.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'firma-flujos-table',
        target: '[data-tour="firma-flujos-table"]',
        title: 'Tabla Completa de Flujos',
        content: 'Visualiza todos los flujos de firma con información detallada: nombre descriptivo del flujo, documento asociado, estado actual (pendiente/en progreso/completado), lista de firmantes con su orden, progreso visual (ej: 2/5 firmas) y fechas. Haz clic en cualquier flujo para ver detalles completos, historial y próximos pasos.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'firma-validar-tour': {
    id: 'firma-validar-tour',
    name: 'Validación de Firmas Digitales',
    description: 'Verifica la autenticidad, validez e integridad de firmas digitales en documentos. Validación interna (rápida) o externa oficial de Firma Perú.',
    module: 'firma',
    steps: [
      {
        id: 'firma-validar-header',
        target: '[data-tour="firma-validar-header"]',
        title: '¡Bienvenido a la Validación de Firmas!',
        content: 'Aquí puedes verificar la autenticidad, validez legal e integridad de firmas digitales en documentos. La validación confirma: ✓ La firma es auténtica (certificado válido), ✓ El documento no ha sido modificado después de la firma, ✓ El certificado no está revocado. Selecciona un documento desde la lista o desde el módulo de archivo para validar todas sus firmas.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-validar-tabs',
        target: '[data-tour="firma-validar-tabs"]',
        title: 'Tipos de Validación Disponibles',
        content: 'Una vez seleccionado un documento, elige el tipo de validación: 1) INTERNA: Rápida, verifica con registros del sistema (segundos), 2) EXTERNA: Validación oficial contra servidores de Firma Perú/RENIEC (más lenta pero con validez legal plena), 3) HISTORIAL: Revisa todas las validaciones previas realizadas al documento con fechas y resultados.',
        placement: 'bottom',
        highlightPadding: 10,
      },
    ],
  },

  'firma-analytics-tour': {
    id: 'firma-analytics-tour',
    name: 'Analítica de Firma Digital',
    description: 'Consulta estadísticas detalladas, tendencias de uso, distribución y métricas del sistema de firma digital para tomar decisiones informadas.',
    module: 'firma',
    steps: [
      {
        id: 'firma-analytics-header',
        target: '[data-tour="firma-analytics-header"]',
        title: '¡Bienvenido a la Analítica de Firma Digital!',
        content: 'Aquí encontrarás métricas detalladas y estadísticas completas sobre el uso del sistema de firma digital: tendencias temporales, distribución por tipo de documento, top firmantes más activos, tasas de adopción y más. Ideal para reportes gerenciales y análisis de uso.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-analytics-filters',
        target: '[data-tour="firma-analytics-filters"]',
        title: 'Filtros de Período Temporal',
        content: 'Selecciona el rango de fechas para ver estadísticas de un período específico. Puedes usar presets rápidos (última semana, último mes, último año) o elegir fechas personalizadas con el selector de calendario. Todas las métricas y gráficos se actualizarán automáticamente.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'firma-analytics-metrics',
        target: '[data-tour="firma-analytics-metrics"]',
        title: 'Panel de Métricas Principales',
        content: 'Visualiza las métricas clave del período seleccionado: total de firmas realizadas, promedio de firmas por día, cantidad de documentos firmados únicos, tasa de adopción (% de documentos firmados vs totales), tiempo promedio de completar flujos de firma y usuarios activos.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'firma-analytics-trend',
        target: '[data-tour="firma-analytics-trend"]',
        title: 'Gráfico de Tendencia Temporal',
        content: 'Este gráfico de líneas muestra la evolución de firmas digitales a lo largo del tiempo (día a día o mes a mes según el período). Identifica picos de actividad, tendencias de crecimiento, caídas estacionales y patrones de uso. Útil para planificar capacitaciones y recursos.',
        placement: 'top',
        highlightPadding: 12,
      },
      {
        id: 'firma-analytics-charts',
        target: '[data-tour="firma-analytics-charts"]',
        title: 'Distribución y Ranking de Firmantes',
        content: 'Analiza gráficos complementarios: 1) Distribución de firmas por tipo de documento (oficio, resolución, etc.) para identificar los documentos más firmados, 2) Ranking de top firmantes más activos con totales individuales. Exporta estos datos para análisis detallados.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  // ============================================
  // SECCIÓN 5: REPORTES Y ANALÍTICA
  // ============================================
  'reportes-intro-tour': {
    id: 'reportes-intro-tour',
    name: 'Introducción al Módulo de Reportes',
    description: 'Genera reportes detallados y exportables sobre documentos, actividad de usuarios y firmas digitales. Analiza datos con gráficos y tablas completas.',
    module: 'reportes',
    steps: [
      {
        id: 'reportes-header',
        target: '[data-tour="reportes-header"]',
        title: '¡Bienvenido al Módulo de Reportes y Analítica!',
        content: 'Aquí puedes generar reportes detallados y profesionales sobre tres áreas principales: 1) Documentos (tipos, distribución, tendencias), 2) Actividad de usuarios (acciones, módulos más usados, usuarios activos), 3) Firmas digitales (uso, validaciones, flujos). Todos los reportes son exportables en PDF, Excel o CSV.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'reportes-guided-tour',
        target: '[data-tour="reportes-guided-tour"]',
        title: 'Tours Específicos por Tipo de Reporte',
        content: 'Usa este menú desplegable para acceder a tours guiados detallados de cada tipo de reporte: documentos, actividad y firmas. Cada tour te explicará cómo interpretar las métricas, gráficos y tablas cuando generes datos. Ideal para usuarios nuevos.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'reportes-filters',
        target: '[data-tour="reportes-filters"]',
        title: 'Generar tu Primer Reporte',
        content: 'Para generar un reporte: 1) Selecciona el tipo de reporte que deseas (documentos, actividad o firmas), 2) Ajusta el rango de fechas (última semana, mes, año o personalizado), 3) Haz clic en "Generar Reporte". Una vez generado, visualiza los datos en pantalla y expórtalos en el formato que prefieras (PDF para imprimir, Excel para análisis, CSV para procesamiento).',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  // ============================================
  // SECCIÓN 6: ADMINISTRACIÓN
  // ============================================
  'usuarios-tour': {
    id: 'usuarios-tour',
    name: 'Gestión de Usuarios',
    description: 'Crea, edita y administra usuarios del sistema. Asigna roles, permisos y oficinas. Control completo de accesos y credenciales.',
    module: 'usuarios',
    steps: [
      {
        id: 'usuarios-welcome',
        target: '[data-tour="usuarios-create-button"]',
        title: '¡Bienvenido a la Gestión de Usuarios!',
        content: 'Aquí administras todos los usuarios que tienen acceso al sistema. Puedes crear nuevas cuentas, asignar roles y permisos específicos, asociar usuarios a oficinas y gestionar credenciales. Es fundamental para mantener la seguridad y control de accesos del sistema.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'usuarios-stats',
        target: '[data-tour="usuarios-stats"]',
        title: 'Estadísticas de Usuarios',
        content: 'Visualiza métricas importantes: total de usuarios registrados, usuarios activos (con acceso habilitado), usuarios inactivos o bloqueados, y distribución por roles (administradores, usuarios estándar, etc.). Monitorea la salud de tu base de usuarios.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'usuarios-search',
        target: '[data-tour="usuarios-search"]',
        title: 'Buscar y Filtrar Usuarios',
        content: 'Busca usuarios por nombre completo, email o nombre de usuario. Utiliza los filtros avanzados para refinar por rol asignado, oficina de pertenencia, estado (activo/inactivo) o fecha de registro. Encuentra rápidamente el usuario que necesitas gestionar.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'usuarios-table',
        target: '[data-tour="usuarios-table"]',
        title: 'Tabla Completa de Usuarios',
        content: 'Visualiza todos los usuarios con información detallada: nombre completo, email, nombre de usuario, rol asignado, oficina de pertenencia, estado (activo/inactivo) y última sesión. Haz clic en cualquier usuario para editar sus datos, cambiar su contraseña, modificar permisos o desactivar su cuenta.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'oficinas-tour': {
    id: 'oficinas-tour',
    name: 'Gestión de Oficinas',
    description: 'Administra las oficinas y áreas de tu organización. Organiza la estructura administrativa y asocia documentos a oficinas emisoras o receptoras.',
    module: 'oficinas',
    steps: [
      {
        id: 'oficinas-welcome',
        target: '[data-tour="oficinas-create-button"]',
        title: '¡Bienvenido a la Gestión de Oficinas!',
        content: 'Las oficinas representan las áreas administrativas, departamentos o unidades de tu organización (ejemplo: Recursos Humanos, Contabilidad, Dirección General). Los documentos se asocian a oficinas emisoras, y los usuarios pertenecen a oficinas específicas para control de acceso.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'oficinas-stats',
        target: '[data-tour="oficinas-stats"]',
        title: 'Estadísticas de Oficinas',
        content: 'Visualiza métricas clave: total de oficinas registradas, documentos asociados a cada oficina, usuarios asignados por oficina y distribución de actividad. Identifica las áreas más activas del sistema.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'oficinas-search',
        target: '[data-tour="oficinas-search"]',
        title: 'Buscar Oficinas',
        content: 'Busca oficinas por nombre o código de identificación. La búsqueda es instantánea y te permite encontrar rápidamente la oficina que necesitas editar o consultar.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'oficinas-table',
        target: '[data-tour="oficinas-table"]',
        title: 'Tabla de Oficinas',
        content: 'Visualiza todas las oficinas con su información: código, nombre descriptivo, cantidad de usuarios asignados, documentos emitidos y estado (activa/inactiva). Haz clic en cualquier oficina para editar sus datos o ver su actividad detallada.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'tipos-documento-tour': {
    id: 'tipos-documento-tour',
    name: 'Gestión de Tipos de Documento',
    description: 'Define y administra las tipologías de documentos de tu organización: oficios, memorandos, resoluciones, actas, etc. Estandariza la clasificación.',
    module: 'tipos-documento',
    steps: [
      {
        id: 'tipos-doc-welcome',
        target: '[data-tour="tipos-documento-create-button"]',
        title: '¡Bienvenido a la Gestión de Tipos de Documento!',
        content: 'Los tipos de documento definen las categorías o tipologías de documentos que maneja tu organización (ejemplos: Oficio, Memorando, Resolución, Acta, Informe, Carta). Cada documento cargado debe asociarse a un tipo para mantener la organización y facilitar búsquedas.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'tipos-doc-stats',
        target: '[data-tour="tipos-documento-stats"]',
        title: 'Estadísticas por Tipo',
        content: 'Visualiza métricas importantes: total de tipos de documento definidos, cantidad de documentos asociados a cada tipo y distribución de uso. Identifica los tipos de documento más utilizados en tu organización.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'tipos-doc-search',
        target: '[data-tour="tipos-documento-search"]',
        title: 'Buscar Tipos de Documento',
        content: 'Busca tipos de documento por nombre o código. Útil cuando tienes muchas tipologías definidas y necesitas editar o consultar una específica rápidamente.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'tipos-doc-table',
        target: '[data-tour="tipos-documento-table"]',
        title: 'Tabla de Tipos de Documento',
        content: 'Visualiza todos los tipos de documento definidos con información detallada: código de identificación, nombre descriptivo, abreviatura (opcional), cantidad de documentos asociados y estado (activo/inactivo). Haz clic en cualquier tipo para editarlo o desactivarlo.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'periodos-tour': {
    id: 'periodos-tour',
    name: 'Gestión de Períodos',
    description: 'Define períodos temporales para organizar archivadores y documentos: años fiscales, gestiones administrativas o rangos personalizados.',
    module: 'periodos',
    steps: [
      {
        id: 'periodos-welcome',
        target: '[data-tour="periodos-create-button"]',
        title: '¡Bienvenido a la Gestión de Períodos!',
        content: 'Los períodos son rangos temporales que se utilizan para organizar archivadores y documentos (ejemplos: "Año 2024", "Gestión 2023-2024", "Primer Semestre 2025"). Cada archivador pertenece a un período específico, facilitando la organización cronológica y búsqueda histórica.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'periodos-stats',
        target: '[data-tour="periodos-stats"]',
        title: 'Estadísticas de Períodos',
        content: 'Visualiza métricas clave: total de períodos definidos, archivadores asociados a cada período, documentos contenidos y estado (activo/archivado). Identifica los períodos con mayor actividad.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'periodos-search',
        target: '[data-tour="periodos-search"]',
        title: 'Buscar Períodos',
        content: 'Busca períodos por nombre o año. La búsqueda te permite encontrar rápidamente el período que necesitas editar o consultar, especialmente útil cuando tienes muchos períodos históricos.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'periodos-table',
        target: '[data-tour="periodos-table"]',
        title: 'Tabla de Períodos',
        content: 'Visualiza todos los períodos con información: nombre descriptivo, fechas de inicio y fin, cantidad de archivadores asociados, total de documentos contenidos y estado (activo/cerrado). Haz clic en cualquier período para editarlo o ver su contenido completo.',
        placement: 'top',
        highlightPadding: 12,
      },
    ],
  },

  'auditoria-tour': {
    id: 'auditoria-tour',
    name: 'Auditoría y Trazabilidad',
    description: 'Consulta el registro completo de todas las acciones realizadas en el sistema. Trazabilidad total para seguridad, cumplimiento y resolución de incidentes.',
    module: 'auditoria',
    steps: [
      {
        id: 'auditoria-header',
        target: '[data-tour="auditoria-header"]',
        title: '¡Bienvenido al Módulo de Auditoría!',
        content: 'El sistema mantiene un registro completo y permanente de TODAS las acciones realizadas: quién accedió, qué documento consultó, qué modificó, qué descargó, qué firmó, cuándo y desde dónde. Este módulo es fundamental para seguridad, cumplimiento normativo y resolución de incidentes.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'auditoria-filters',
        target: '[data-tour="auditoria-filters"]',
        title: 'Filtros Avanzados de Auditoría',
        content: 'Filtra registros de auditoría por múltiples criterios: usuario específico (quién realizó la acción), módulo del sistema (documento, firma, expediente, etc.), tipo de acción (crear, modificar, eliminar, descargar), rango de fechas y más. Combina filtros para investigaciones específicas.',
        placement: 'bottom',
        highlightPadding: 10,
      },
      {
        id: 'auditoria-table',
        target: '[data-tour="auditoria-table"]',
        title: 'Registro Completo de Auditoría',
        content: 'Cada entrada muestra información detallada: fecha y hora exacta, usuario que realizó la acción (nombre completo), módulo afectado, acción específica (ejemplo: "Descargó documento X", "Firmó documento Y"), dirección IP de origen y resultado (éxito/fallo). Los registros NO pueden eliminarse ni modificarse.',
        placement: 'top',
        highlightPadding: 12,
      },
      {
        id: 'auditoria-export',
        target: '[data-tour="auditoria-export"]',
        title: 'Exportar Registros de Auditoría',
        content: 'Exporta los registros filtrados a Excel o CSV para análisis detallado, reportes de cumplimiento o investigaciones. Los archivos exportados mantienen todas las columnas con información completa.',
        placement: 'left',
        highlightPadding: 8,
      },
    ],
  },

  // ============================================
  // SECCIÓN 7: CONFIGURACIÓN
  // ============================================
  'roles-tour': {
    id: 'roles-tour',
    name: 'Gestión de Roles y Permisos',
    description: 'Define roles personalizados con permisos granulares. Control de acceso basado en roles (RBAC) para seguridad y organización.',
    module: 'roles',
    steps: [
      {
        id: 'roles-welcome',
        target: '[data-tour="roles-create-button"]',
        title: '¡Bienvenido a la Gestión de Roles!',
        content: 'Los roles definen conjuntos de permisos que se asignan a usuarios. Puedes crear roles personalizados para tu organización (ejemplos: "Jefe de Oficina", "Asistente Administrativo", "Auditor"). Cada rol tiene permisos específicos sobre módulos y acciones del sistema.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'roles-stats',
        target: '[data-tour="roles-stats"]',
        title: 'Estadísticas de Roles',
        content: 'Visualiza métricas: total de roles definidos, usuarios asignados a cada rol y distribución de permisos. Identifica roles con muchos usuarios o roles sin uso.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'roles-table',
        target: '[data-tour="roles-table"]',
        title: 'Tabla de Roles',
        content: 'Visualiza todos los roles con información: nombre, descripción, cantidad de usuarios asignados, permisos otorgados (módulos accesibles) y estado. Haz clic en cualquier rol para editar sus permisos de forma granular: marcar o desmarcar acceso a cada módulo del sistema.',
        placement: 'top',
        highlightPadding: 12,
      },
      {
        id: 'roles-permissions',
        target: '[data-tour="roles-permissions"]',
        title: 'Configuración de Permisos',
        content: 'Al editar un rol, marca o desmarca los módulos a los que tendrá acceso: Dashboard, Archivadores, Documentos, Expedientes, Búsqueda, Firma Digital, Reportes, Administración, etc. Los usuarios con este rol solo podrán acceder a los módulos que marques.',
        placement: 'right',
        highlightPadding: 12,
      },
    ],
  },

  'configuracion-tour': {
    id: 'configuracion-tour',
    name: 'Configuración del Sistema',
    description: 'Personaliza el sistema con tu marca corporativa: logo, colores, nombre de empresa, sello digital y configuraciones avanzadas.',
    module: 'configuracion',
    steps: [
      {
        id: 'configuracion-general',
        target: '[data-tour="configuracion-general"]',
        title: '¡Bienvenido a la Configuración del Sistema!',
        content: 'Aquí puedes personalizar completamente el sistema con tu identidad corporativa: nombre oficial de la empresa, slogan o lema, colores de marca (primario y secundario), datos de contacto y más. Estos cambios se reflejan en toda la interfaz, reportes y exportaciones.',
        placement: 'right',
        highlightPadding: 12,
      },
      {
        id: 'configuracion-branding',
        target: '[data-tour="configuracion-branding"]',
        title: 'Marca Corporativa y Logotipos',
        content: 'Sube tu logo corporativo (PNG o SVG recomendado) para que aparezca en la barra de navegación superior, encabezados de reportes y documentos exportados. También puedes configurar un sello institucional para incluirlo automáticamente en las firmas digitales.',
        placement: 'right',
        highlightPadding: 12,
      },
      {
        id: 'configuracion-firma',
        target: '[data-tour="configuracion-firma"]',
        title: 'Configuración de Firma Digital',
        content: 'Activa o desactiva el uso del sello corporativo en las firmas digitales. Cuando está activo, el sello configurado se incluirá automáticamente en todos los documentos firmados, junto con la firma digital del usuario. Define también las URLs externas para recursos de firma si aplica.',
        placement: 'right',
        highlightPadding: 12,
      },
      {
        id: 'configuracion-preview',
        target: '[data-tour="configuracion-preview"]',
        title: 'Vista Previa de Cambios',
        content: 'Antes de guardar, observa la vista previa de cómo se verá el sistema con tus configuraciones: colores aplicados, logo en el navbar y distribución general. Una vez satisfecho, guarda los cambios y se aplicarán inmediatamente para todos los usuarios.',
        placement: 'left',
        highlightPadding: 10,
      },
    ],
  },

  // ============================================
  // SECCIÓN 8: SEGURIDAD
  // ============================================
  'copias-seguridad-tour': {
    id: 'copias-seguridad-tour',
    name: 'Copias de Seguridad',
    description: 'Gestiona copias de seguridad (backups) de la base de datos. Crea respaldos manuales, programa automáticos y restaura cuando sea necesario.',
    module: 'copias-seguridad',
    steps: [
      {
        id: 'copias-header',
        target: '[data-tour="copias-header"]',
        title: '¡Bienvenido al Módulo de Copias de Seguridad!',
        content: 'Las copias de seguridad son fundamentales para proteger tus datos contra pérdidas accidentales, fallos del sistema o incidentes de seguridad. Aquí puedes crear backups manuales de la base de datos completa, programar copias automáticas y restaurar datos de backups anteriores.',
        placement: 'bottom',
        highlightPadding: 12,
      },
      {
        id: 'copias-create',
        target: '[data-tour="copias-create-button"]',
        title: 'Crear Copia de Seguridad Manual',
        content: 'Haz clic aquí para crear una copia de seguridad inmediata de la base de datos completa. El proceso puede tomar varios minutos dependiendo del tamaño de tus datos. Te recomendamos crear copias antes de actualizaciones importantes o cambios masivos en el sistema.',
        placement: 'left',
        highlightPadding: 8,
      },
      {
        id: 'copias-schedule',
        target: '[data-tour="copias-schedule"]',
        title: 'Programar Copias Automáticas',
        content: 'Configura un programa automático de copias de seguridad: diarias, semanales o mensuales. Define la hora de ejecución (preferiblemente fuera del horario laboral) y cuántas copias mantener. El sistema creará y gestionará las copias automáticamente.',
        placement: 'right',
        highlightPadding: 12,
      },
      {
        id: 'copias-table',
        target: '[data-tour="copias-table"]',
        title: 'Historial de Copias de Seguridad',
        content: 'Visualiza todas las copias de seguridad disponibles: fecha y hora de creación, tipo (manual/automática), tamaño del archivo, estado (exitosa/fallida) y acciones. Puedes descargar copias para almacenamiento externo, restaurar el sistema a un estado anterior o eliminar copias antiguas.',
        placement: 'top',
        highlightPadding: 12,
      },
      {
        id: 'copias-restore',
        target: '[data-tour="copias-restore"]',
        title: 'Restaurar desde Copia de Seguridad',
        content: 'Para restaurar el sistema a un estado anterior, selecciona una copia de la lista y confirma la restauración. ⚠️ ADVERTENCIA: Este proceso reemplazará TODOS los datos actuales con los datos de la copia seleccionada. Todos los cambios posteriores a esa fecha se perderán. Úsalo solo en emergencias.',
        placement: 'left',
        highlightPadding: 10,
      },
    ],
  },
};

export function getTour(tourId: string): CoachMarkTour | undefined {
  return tours[tourId];
}

export function getToursByModule(module: CoachMarkTour['module']): CoachMarkTour[] {
  return Object.values(tours).filter((tour) => tour.module === module);
}
