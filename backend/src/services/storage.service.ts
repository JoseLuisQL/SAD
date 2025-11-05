import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface FileData {
  path: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const saveFile = async (file: Express.Multer.File): Promise<FileData> => {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo');
  }

  return {
    path: file.path,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype
  };
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw new Error('No se pudo eliminar el archivo');
  }
};

export const getFile = async (filePath: string): Promise<Buffer> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('Archivo no encontrado');
    }
    
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error('Error al leer archivo:', error);
    throw new Error('No se pudo leer el archivo');
  }
};

export const validatePDF = (file: Express.Multer.File): boolean => {
  if (!file) {
    return false;
  }

  if (file.mimetype !== 'application/pdf') {
    return false;
  }

  if (file.size > 50 * 1024 * 1024) { // 50 MB
    return false;
  }

  return true;
};

export const getFileSize = (filePath: string): number => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error al obtener tamaño del archivo:', error);
    return 0;
  }
};

export const generateUniqueName = (originalName: string): string => {
  const ext = path.extname(originalName);
  return `${Date.now()}-${uuidv4()}${ext}`;
};

export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

export const getFileStream = (filePath: string): fs.ReadStream => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Archivo no encontrado');
  }
  
  return fs.createReadStream(filePath);
};

export default {
  saveFile,
  deleteFile,
  getFile,
  validatePDF,
  getFileSize,
  generateUniqueName,
  fileExists,
  getFileStream
};
