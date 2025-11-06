import { Request, Response } from 'express';
import * as configurationService from '../services/configuration.service';
import { updateSystemConfigSchema } from '../utils/validators';

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await configurationService.getSystemConfig(req);

    res.status(200).json({
      status: 'success',
      message: 'Configuración del sistema obtenida correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener configuración del sistema'
    });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { error, value } = updateSystemConfigSchema.validate(req.body);

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

    const config = await configurationService.updateGeneralConfig(value, req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'Configuración actualizada correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar configuración'
    });
  }
};

export const uploadLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const config = await configurationService.updateBrandAssets(
      { logo: req.file },
      req.user.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Logo actualizado correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar logo'
    });
  }
};

export const uploadStamp = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const config = await configurationService.updateBrandAssets(
      { stamp: req.file },
      req.user.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Sello actualizado correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar sello'
    });
  }
};

export const removeLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const config = await configurationService.removeBrandAsset('logo', req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'Logo eliminado correctamente',
      data: config
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Configuración del sistema no encontrada') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar logo'
    });
  }
};

export const removeStamp = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const config = await configurationService.removeBrandAsset('stamp', req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'Sello eliminado correctamente',
      data: config
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Configuración del sistema no encontrada') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar sello'
    });
  }
};

export const uploadFavicon = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const config = await configurationService.updateBrandAssets(
      { favicon: req.file },
      req.user.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Favicon actualizado correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar favicon'
    });
  }
};

export const removeFavicon = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const config = await configurationService.removeBrandAsset('favicon', req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'Favicon eliminado correctamente',
      data: config
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Configuración del sistema no encontrada') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar favicon'
    });
  }
};

export const uploadLoginBackground = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo'
      });
      return;
    }

    const { slot } = req.params;
    
    if (!slot || !['1', '2', '3', '4', '5'].includes(slot)) {
      res.status(400).json({
        status: 'error',
        message: 'Slot inválido. Debe ser un número entre 1 y 5'
      });
      return;
    }

    const bgKey = `loginBg${slot}` as 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';
    
    const config = await configurationService.updateBrandAssets(
      { [bgKey]: req.file },
      req.user.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: `Imagen de fondo ${slot} actualizada correctamente`,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar imagen de fondo'
    });
  }
};

export const removeLoginBackground = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { slot } = req.params;
    
    if (!slot || !['1', '2', '3', '4', '5'].includes(slot)) {
      res.status(400).json({
        status: 'error',
        message: 'Slot inválido. Debe ser un número entre 1 y 5'
      });
      return;
    }

    const bgType = `loginBg${slot}` as 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

    const config = await configurationService.removeBrandAsset(bgType, req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: `Imagen de fondo ${slot} eliminada correctamente`,
      data: config
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Configuración del sistema no encontrada') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al eliminar imagen de fondo'
    });
  }
};

export const updateExternalUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const config = await configurationService.updateExternalUrls(req.body, req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'URLs externas actualizadas correctamente',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al actualizar URLs externas'
    });
  }
};

export default {
  getConfig,
  updateConfig,
  uploadLogo,
  uploadStamp,
  uploadFavicon,
  uploadLoginBackground,
  removeLogo,
  removeStamp,
  removeFavicon,
  removeLoginBackground,
  updateExternalUrls
};
