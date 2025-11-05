import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage directories for system configuration assets
const systemConfigDir = path.join(process.cwd(), 'uploads', 'system-config');
const logoDir = path.join(systemConfigDir, 'logo');
const stampDir = path.join(systemConfigDir, 'stamp');

// Ensure directories exist on service initialization
const ensureDirectories = () => {
  [systemConfigDir, logoDir, stampDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Initialize directories
ensureDirectories();

/**
 * Allowed MIME types for logo and stamp images
 */
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
];

/**
 * Maximum file size: 5 MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface AssetMetadata {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

/**
 * Validate image file for logo/stamp upload
 */
export const validateImageFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No se proporcionó ningún archivo' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos válidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de 5 MB (tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    };
  }

  return { valid: true };
};

/**
 * Save logo file to system-config/logo directory
 */
export const saveLogo = async (file: Express.Multer.File): Promise<AssetMetadata> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const ext = path.extname(file.originalname);
  const uniqueName = `logo-${Date.now()}-${uuidv4()}${ext}`;
  const filePath = path.join(logoDir, uniqueName);

  // Save file
  fs.writeFileSync(filePath, file.buffer);

  return {
    fileName: uniqueName,
    filePath,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
};

/**
 * Save stamp file to system-config/stamp directory
 */
export const saveStamp = async (file: Express.Multer.File): Promise<AssetMetadata> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const ext = path.extname(file.originalname);
  const uniqueName = `stamp-${Date.now()}-${uuidv4()}${ext}`;
  const filePath = path.join(stampDir, uniqueName);

  // Save file
  fs.writeFileSync(filePath, file.buffer);

  return {
    fileName: uniqueName,
    filePath,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
};

/**
 * Delete logo file and clean up old files
 */
export const deleteLogo = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted logo file: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al eliminar logo:', error);
    throw new Error('No se pudo eliminar el archivo de logo');
  }
};

/**
 * Delete stamp file and clean up old files
 */
export const deleteStamp = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted stamp file: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al eliminar stamp:', error);
    throw new Error('No se pudo eliminar el archivo de estampado');
  }
};

/**
 * Replace logo file (delete old, save new)
 */
export const replaceLogo = async (
  oldFilePath: string | null,
  newFile: Express.Multer.File
): Promise<AssetMetadata> => {
  // Save new file first
  const newMetadata = await saveLogo(newFile);

  // Delete old file if it exists
  if (oldFilePath) {
    try {
      await deleteLogo(oldFilePath);
    } catch (error) {
      console.error('Error deleting old logo (non-critical):', error);
      // Don't throw - new file is already saved
    }
  }

  return newMetadata;
};

/**
 * Replace stamp file (delete old, save new)
 */
export const replaceStamp = async (
  oldFilePath: string | null,
  newFile: Express.Multer.File
): Promise<AssetMetadata> => {
  // Save new file first
  const newMetadata = await saveStamp(newFile);

  // Delete old file if it exists
  if (oldFilePath) {
    try {
      await deleteStamp(oldFilePath);
    } catch (error) {
      console.error('Error deleting old stamp (non-critical):', error);
      // Don't throw - new file is already saved
    }
  }

  return newMetadata;
};

/**
 * Check if file exists
 */
export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

/**
 * Get file stream for serving
 */
export const getFileStream = (filePath: string): fs.ReadStream => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Archivo no encontrado');
  }
  return fs.createReadStream(filePath);
};

export default {
  validateImageFile,
  saveLogo,
  saveStamp,
  deleteLogo,
  deleteStamp,
  replaceLogo,
  replaceStamp,
  fileExists,
  getFileStream,
};
