import * as z from 'zod';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';

export const generalConfigSchema = z.object({
  companyName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  companyTagline: z.string().optional().nullable(),
  companyEmail: z.string().email('Email invalido').optional().nullable().or(z.literal('')),
  contactPhone: z.string().optional().nullable(),
  supportEmail: z.string().email('Email de soporte invalido').optional().nullable().or(z.literal('')),
  websiteUrl: z.string().url('URL invalida').optional().nullable().or(z.literal('')),
  primaryColor: z.string().optional().nullable(),
  accentColor: z.string().optional().nullable(),
  signatureStampEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});

export type GeneralConfigFormData = z.infer<typeof generalConfigSchema>;

export type AssetType = 'logo' | 'favicon' | 'stamp' | 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

export interface ConfigurationFormProps {
  register: UseFormRegister<GeneralConfigFormData>;
  watch: UseFormWatch<GeneralConfigFormData>;
  setValue: UseFormSetValue<GeneralConfigFormData>;
  errors: FieldErrors<GeneralConfigFormData>;
}
