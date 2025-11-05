import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as storageService from '../services/storage.service';

export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        status: 'error',
        message: 'El archivo excede el tamaño máximo permitido (50 MB)'
      });
      return;
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        status: 'error',
        message: 'Se excedió el número máximo de archivos permitidos'
      });
      return;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        status: 'error',
        message: 'Campo de archivo inesperado'
      });
      return;
    }

    res.status(400).json({
      status: 'error',
      message: 'Error al procesar el archivo: ' + err.message
    });
    return;
  }

  if (err && err.message === 'Solo se permiten archivos PDF') {
    res.status(400).json({
      status: 'error',
      message: 'Solo se permiten archivos PDF'
    });
    return;
  }

  if (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error al procesar el archivo'
    });
    return;
  }

  next();
};

export const validateFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file && !req.files) {
    res.status(400).json({
      status: 'error',
      message: 'No se proporcionó ningún archivo'
    });
    return;
  }

  if (req.file) {
    if (!storageService.validatePDF(req.file)) {
      storageService.deleteFile(req.file.path).catch(() => {});
      res.status(400).json({
        status: 'error',
        message: 'El archivo no es un PDF válido o excede el tamaño máximo'
      });
      return;
    }
  }

  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      if (!storageService.validatePDF(file)) {
        for (const f of req.files) {
          storageService.deleteFile(f.path).catch(() => {});
        }
        res.status(400).json({
          status: 'error',
          message: 'Uno o más archivos no son PDFs válidos o exceden el tamaño máximo'
        });
        return;
      }
    }
  }

  next();
};

export const cleanupOnError = (
  err: any,
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err && req.file) {
    storageService.deleteFile(req.file.path).catch(() => {});
  }

  if (err && req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      storageService.deleteFile(file.path).catch(() => {});
    }
  }

  next(err);
};

export default {
  handleUploadError,
  validateFile,
  cleanupOnError
};
