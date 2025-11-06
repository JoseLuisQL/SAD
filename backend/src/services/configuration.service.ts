import { Request } from 'express';
import prisma from '../config/database';
import * as auditService from './audit.service';
import * as storageService from './storage.service';
import cache from '../utils/cache.util';
import fs from 'fs';
import path from 'path';

const CACHE_KEY = 'system:configuration';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const systemConfigDir = path.join(process.cwd(), 'uploads', 'system-config');

if (!fs.existsSync(systemConfigDir)) {
  fs.mkdirSync(systemConfigDir, { recursive: true });
}

interface SystemConfigDTO {
  id: string;
  companyName: string;
  companyTagline: string | null;
  companyEmail: string | null;
  contactPhone: string | null;
  supportEmail: string | null;
  websiteUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  stampUrl: string | null;
  loginBackgrounds: string[];
  signatureStampEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt: Date;
}

interface UpdateGeneralConfigPayload {
  companyName?: string;
  companyTagline?: string;
  companyEmail?: string;
  contactPhone?: string;
  supportEmail?: string;
  websiteUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  signatureStampEnabled?: boolean;
  maintenanceMode?: boolean;
}

interface UpdateExternalUrlsPayload {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  stampUrl?: string | null;
  loginBg1Url?: string | null;
  loginBg2Url?: string | null;
  loginBg3Url?: string | null;
  loginBg4Url?: string | null;
  loginBg5Url?: string | null;
}

interface BrandAssetFiles {
  logo?: Express.Multer.File;
  favicon?: Express.Multer.File;
  stamp?: Express.Multer.File;
  loginBg1?: Express.Multer.File;
  loginBg2?: Express.Multer.File;
  loginBg3?: Express.Multer.File;
  loginBg4?: Express.Multer.File;
  loginBg5?: Express.Multer.File;
}

type BrandAssetType = 'logo' | 'favicon' | 'stamp' | 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

const formatConfigDTO = (config: any, baseUrl: string): SystemConfigDTO => {
  const loginBackgrounds: string[] = [];
  
  for (let i = 1; i <= 5; i++) {
    // Priorizar URL externa sobre archivo local
    const bgUrl = config[`loginBg${i}Url`];
    const bgPath = config[`loginBg${i}FilePath`];
    
    if (bgUrl) {
      loginBackgrounds.push(bgUrl);
    } else if (bgPath) {
      loginBackgrounds.push(`${baseUrl}/api/configuration/assets/${path.basename(bgPath)}`);
    }
  }

  return {
    id: config.id,
    companyName: config.companyName,
    companyTagline: config.companyTagline,
    companyEmail: config.companyEmail,
    contactPhone: config.contactPhone,
    supportEmail: config.supportEmail,
    websiteUrl: config.websiteUrl,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    // Priorizar URL externa sobre archivo local
    logoUrl: config.logoUrl || (config.logoFilePath ? `${baseUrl}/api/configuration/assets/${path.basename(config.logoFilePath)}` : null),
    faviconUrl: config.faviconUrl || (config.faviconFilePath ? `${baseUrl}/api/configuration/assets/${path.basename(config.faviconFilePath)}` : null),
    stampUrl: config.stampUrl || (config.stampFilePath ? `${baseUrl}/api/configuration/assets/${path.basename(config.stampFilePath)}` : null),
    loginBackgrounds,
    signatureStampEnabled: config.signatureStampEnabled,
    maintenanceMode: config.maintenanceMode,
    updatedAt: config.updatedAt
  };
};

export const getSystemConfig = async (req?: Request): Promise<SystemConfigDTO> => {
  const cached = cache.get<SystemConfigDTO>(CACHE_KEY);
  
  if (cached) {
    return cached;
  }

  const config = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  const baseUrl = req 
    ? `${req.protocol}://${req.get('host')}`
    : process.env.BACKEND_URL || 'http://localhost:4000';

  const dto = config 
    ? formatConfigDTO(config, baseUrl)
    : {
        id: '',
        companyName: 'Sistema Integrado de Archivos Digitales',
        companyTagline: null,
        companyEmail: null,
        contactPhone: null,
        supportEmail: null,
        websiteUrl: null,
        primaryColor: null,
        accentColor: null,
        logoUrl: null,
        faviconUrl: null,
        stampUrl: null,
        loginBackgrounds: [],
        signatureStampEnabled: true,
        maintenanceMode: false,
        updatedAt: new Date()
      };

  cache.set(CACHE_KEY, dto, CACHE_TTL);

  return dto;
};

export const updateGeneralConfig = async (
  payload: UpdateGeneralConfigPayload,
  userId: string,
  req?: Request
): Promise<SystemConfigDTO> => {
  const existingConfig = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  const config = await prisma.systemConfig.upsert({
    where: { id: existingConfig?.id || '' },
    update: {
      ...payload,
      updatedBy: userId
    },
    create: {
      companyName: payload.companyName || 'Sistema Integrado de Archivos Digitales',
      companyTagline: payload.companyTagline,
      companyEmail: payload.companyEmail,
      contactPhone: payload.contactPhone,
      supportEmail: payload.supportEmail,
      websiteUrl: payload.websiteUrl,
      primaryColor: payload.primaryColor,
      accentColor: payload.accentColor,
      signatureStampEnabled: payload.signatureStampEnabled ?? true,
      maintenanceMode: payload.maintenanceMode ?? false,
      updatedBy: userId
    }
  });

  cache.delete(CACHE_KEY);

  await auditService.log({
    userId,
    action: 'CONFIGURATION_UPDATED',
    module: 'Configuration',
    entityType: 'SystemConfig',
    entityId: config.id,
    oldValue: existingConfig,
    newValue: config,
    req
  });

  const baseUrl = req 
    ? `${req.protocol}://${req.get('host')}`
    : process.env.BACKEND_URL || 'http://localhost:4000';

  return formatConfigDTO(config, baseUrl);
};

export const updateBrandAssets = async (
  files: BrandAssetFiles,
  userId: string,
  req?: Request
): Promise<SystemConfigDTO> => {
  const existingConfig = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  const updateData: any = {
    updatedBy: userId
  };

  if (files.logo) {
    if (existingConfig?.logoFilePath && fs.existsSync(existingConfig.logoFilePath)) {
      await storageService.deleteFile(existingConfig.logoFilePath);
    }

    updateData.logoFileName = files.logo.filename;
    updateData.logoFilePath = files.logo.path;
    updateData.logoMimeType = files.logo.mimetype;
    updateData.logoFileSize = files.logo.size;
  }

  if (files.favicon) {
    if (existingConfig?.faviconFilePath && fs.existsSync(existingConfig.faviconFilePath)) {
      await storageService.deleteFile(existingConfig.faviconFilePath);
    }

    updateData.faviconFileName = files.favicon.filename;
    updateData.faviconFilePath = files.favicon.path;
    updateData.faviconMimeType = files.favicon.mimetype;
    updateData.faviconFileSize = files.favicon.size;
  }

  if (files.stamp) {
    if (existingConfig?.stampFilePath && fs.existsSync(existingConfig.stampFilePath)) {
      await storageService.deleteFile(existingConfig.stampFilePath);
    }

    updateData.stampFileName = files.stamp.filename;
    updateData.stampFilePath = files.stamp.path;
    updateData.stampMimeType = files.stamp.mimetype;
    updateData.stampFileSize = files.stamp.size;
  }

  // Handle login background images (1-5)
  for (let i = 1; i <= 5; i++) {
    const bgKey = `loginBg${i}` as keyof BrandAssetFiles;
    const file = files[bgKey];
    
    if (file) {
      const oldPath = existingConfig?.[`loginBg${i}FilePath` as keyof typeof existingConfig];
      if (oldPath && typeof oldPath === 'string' && fs.existsSync(oldPath)) {
        await storageService.deleteFile(oldPath);
      }

      updateData[`loginBg${i}FileName`] = file.filename;
      updateData[`loginBg${i}FilePath`] = file.path;
      updateData[`loginBg${i}MimeType`] = file.mimetype;
      updateData[`loginBg${i}FileSize`] = file.size;
    }
  }

  const config = await prisma.systemConfig.upsert({
    where: { id: existingConfig?.id || '' },
    update: updateData,
    create: {
      companyName: 'Sistema Integrado de Archivos Digitales',
      signatureStampEnabled: true,
      maintenanceMode: false,
      updatedBy: userId,
      ...updateData
    }
  });

  cache.delete(CACHE_KEY);

  await auditService.log({
    userId,
    action: 'BRAND_ASSETS_UPDATED',
    module: 'Configuration',
    entityType: 'SystemConfig',
    entityId: config.id,
    oldValue: existingConfig,
    newValue: { 
      logo: !!files.logo, 
      favicon: !!files.favicon,
      stamp: !!files.stamp,
      loginBg1: !!files.loginBg1,
      loginBg2: !!files.loginBg2,
      loginBg3: !!files.loginBg3,
      loginBg4: !!files.loginBg4,
      loginBg5: !!files.loginBg5
    },
    req
  });

  const baseUrl = req 
    ? `${req.protocol}://${req.get('host')}`
    : process.env.BACKEND_URL || 'http://localhost:4000';

  return formatConfigDTO(config, baseUrl);
};

export const removeBrandAsset = async (
  type: BrandAssetType,
  userId: string,
  req?: Request
): Promise<SystemConfigDTO> => {
  const existingConfig = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!existingConfig) {
    throw new Error('Configuración del sistema no encontrada');
  }

  const updateData: any = {
    updatedBy: userId
  };

  let oldPath: string | null = null;

  if (type === 'logo') {
    oldPath = existingConfig.logoFilePath;
    if (oldPath && fs.existsSync(oldPath)) {
      await storageService.deleteFile(oldPath);
    }
    updateData.logoFileName = null;
    updateData.logoFilePath = null;
    updateData.logoMimeType = null;
    updateData.logoFileSize = null;
  } else if (type === 'favicon') {
    oldPath = existingConfig.faviconFilePath;
    if (oldPath && fs.existsSync(oldPath)) {
      await storageService.deleteFile(oldPath);
    }
    updateData.faviconFileName = null;
    updateData.faviconFilePath = null;
    updateData.faviconMimeType = null;
    updateData.faviconFileSize = null;
  } else if (type === 'stamp') {
    oldPath = existingConfig.stampFilePath;
    if (oldPath && fs.existsSync(oldPath)) {
      await storageService.deleteFile(oldPath);
    }
    updateData.stampFileName = null;
    updateData.stampFilePath = null;
    updateData.stampMimeType = null;
    updateData.stampFileSize = null;
  } else if (type.startsWith('loginBg')) {
    const bgNumber = type.replace('loginBg', '');
    const pathKey = `loginBg${bgNumber}FilePath` as keyof typeof existingConfig;
    oldPath = existingConfig[pathKey] as string | null;
    
    if (oldPath && fs.existsSync(oldPath)) {
      await storageService.deleteFile(oldPath);
    }
    
    updateData[`loginBg${bgNumber}FileName`] = null;
    updateData[`loginBg${bgNumber}FilePath`] = null;
    updateData[`loginBg${bgNumber}MimeType`] = null;
    updateData[`loginBg${bgNumber}FileSize`] = null;
  }

  const config = await prisma.systemConfig.update({
    where: { id: existingConfig.id },
    data: updateData
  });

  cache.delete(CACHE_KEY);

  await auditService.log({
    userId,
    action: 'BRAND_ASSET_REMOVED',
    module: 'Configuration',
    entityType: 'SystemConfig',
    entityId: config.id,
    oldValue: { type, path: oldPath },
    newValue: null,
    req
  });

  const baseUrl = req 
    ? `${req.protocol}://${req.get('host')}`
    : process.env.BACKEND_URL || 'http://localhost:4000';

  return formatConfigDTO(config, baseUrl);
};

export const getStampAssetUrl = async (req?: Request): Promise<string | null> => {
  const config = await getSystemConfig(req);
  return config.stampUrl;
};

export const getStampAssetPath = async (): Promise<string | null> => {
  const config = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  return config?.stampFilePath || null;
};

export const updateExternalUrls = async (
  payload: UpdateExternalUrlsPayload,
  userId: string,
  req?: Request
): Promise<SystemConfigDTO> => {
  const existingConfig = await prisma.systemConfig.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!existingConfig) {
    throw new Error('No se encontró configuración del sistema');
  }

  const config = await prisma.systemConfig.update({
    where: { id: existingConfig.id },
    data: {
      ...payload,
      updatedBy: userId
    }
  });

  cache.delete(CACHE_KEY);

  await auditService.log({
    userId,
    action: 'EXTERNAL_URLS_UPDATED',
    module: 'Configuration',
    entityType: 'SystemConfig',
    entityId: config.id,
    oldValue: existingConfig,
    newValue: config,
    req
  });

  const baseUrl = getBaseUrl(req);
  return formatConfigDTO(config, baseUrl);
};

export default {
  getSystemConfig,
  updateGeneralConfig,
  updateBrandAssets,
  removeBrandAsset,
  getStampAssetUrl,
  getStampAssetPath,
  updateExternalUrls
};
