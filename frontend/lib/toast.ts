import { toast as hotToast } from 'react-hot-toast';

/**
 * Toast wrapper con mensajes accesibles y profesionales
 * Incluye soporte para aria-live regions automáticamente
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  ariaLive?: 'polite' | 'assertive';
  role?: 'status' | 'alert';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  ariaLive: 'polite',
  role: 'status',
};

export const toast = {
  /**
   * Muestra un mensaje de éxito accesible
   */
  success: (message: string, options: ToastOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    return hotToast.success(message, {
      duration: opts.duration,
      position: opts.position,
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
      className: 'toast-success',
    });
  },

  /**
   * Muestra un mensaje de error accesible
   */
  error: (message: string, options: ToastOptions = {}) => {
    const opts = { ...defaultOptions, ...options, ariaLive: 'assertive' };
    return hotToast.error(message, {
      duration: opts.duration,
      position: opts.position,
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
      className: 'toast-error',
    });
  },

  /**
   * Muestra un mensaje informativo accesible
   */
  info: (message: string, options: ToastOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    return hotToast(message, {
      duration: opts.duration,
      position: opts.position,
      icon: 'ℹ️',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
      className: 'toast-info',
    });
  },

  /**
   * Muestra un mensaje de advertencia accesible
   */
  warning: (message: string, options: ToastOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    return hotToast(message, {
      duration: opts.duration,
      position: opts.position,
      icon: '⚠️',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
      className: 'toast-warning',
    });
  },

  /**
   * Muestra un mensaje de carga con promesa
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options: ToastOptions = {}
  ) => {
    const opts = { ...defaultOptions, ...options };
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        duration: opts.duration,
        position: opts.position,
      }
    );
  },

  /**
   * Descarta todos los toasts activos
   */
  dismiss: (toastId?: string) => {
    if (toastId) {
      hotToast.dismiss(toastId);
    } else {
      hotToast.dismiss();
    }
  },
};

/**
 * Mensajes predefinidos para operaciones comunes en reportes
 */
export const reportToastMessages = {
  // Generación de reportes
  generatingReport: 'Generando reporte...',
  reportGenerated: 'Reporte generado correctamente',
  reportGenerationError: 'Error al generar el reporte. Por favor, intente nuevamente.',
  
  // Exportación
  exportingReport: (format: string) => `Exportando reporte a ${format.toUpperCase()}...`,
  reportExported: (format: string) => `Reporte exportado correctamente a ${format.toUpperCase()}`,
  exportError: (format: string) => `Error al exportar el reporte a ${format.toUpperCase()}`,
  
  // Filtros
  filtersCleared: 'Filtros limpiados correctamente',
  filtersApplied: 'Filtros aplicados correctamente',
  invalidDateRange: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  
  // Presets
  presetApplied: (presetName: string) => `Preset "${presetName}" aplicado correctamente`,
  presetSaved: 'Preset guardado correctamente',
  presetDeleted: 'Preset eliminado correctamente',
  
  // General
  noDataFound: 'No se encontraron datos con los filtros seleccionados',
  loadingError: 'Error al cargar los datos. Por favor, intente nuevamente.',
};

export default toast;
