export interface BrandAsset {
  url: string | null;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: Date;
}

export interface BrandingConfig {
  logo: BrandAsset;
  stamp: BrandAsset;
  primaryColor: string | null;
  accentColor: string | null;
}

export interface GeneralConfig {
  companyName: string;
  companyTagline: string | null;
  companyEmail: string | null;
  contactPhone: string | null;
  supportEmail: string | null;
  websiteUrl: string | null;
}

export interface SystemConfig {
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

export interface SystemConfigResponse {
  status: string;
  message: string;
  data: SystemConfig;
}

export interface UpdateGeneralConfigPayload {
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
