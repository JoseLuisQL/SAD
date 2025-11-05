import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const systemConfigDir = path.join(process.cwd(), 'uploads', 'system-config');

if (!fs.existsSync(systemConfigDir)) {
  fs.mkdirSync(systemConfigDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, systemConfigDir);
  },
  filename: (_req, file, cb) => {
    const fieldName = file.fieldname;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    
    const filename = `${fieldName}-${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const fieldName = file.fieldname;
  
  // Different allowed types based on the field
  let allowedMimeTypes: string[] = [];
  let errorMessage = '';
  
  if (fieldName === 'favicon') {
    allowedMimeTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
    errorMessage = 'Solo se permiten archivos PNG o ICO para el favicon';
  } else if (fieldName === 'loginBg') {
    allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    errorMessage = 'Solo se permiten archivos PNG, JPG o WebP para fondos de login';
  } else {
    // logo, stamp, and other assets
    allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    errorMessage = 'Solo se permiten archivos PNG, JPG, SVG o WebP';
  }
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(errorMessage));
  }
};

export const uploadBrandingAssets = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  }
});

export const uploadLogo = uploadBrandingAssets.single('logo');
export const uploadFavicon = uploadBrandingAssets.single('favicon');
export const uploadStamp = uploadBrandingAssets.single('stamp');
export const uploadLoginBg = uploadBrandingAssets.single('loginBg');
export const uploadBrandAssets = uploadBrandingAssets.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'stamp', maxCount: 1 },
  { name: 'loginBg1', maxCount: 1 },
  { name: 'loginBg2', maxCount: 1 },
  { name: 'loginBg3', maxCount: 1 },
  { name: 'loginBg4', maxCount: 1 },
  { name: 'loginBg5', maxCount: 1 }
]);
