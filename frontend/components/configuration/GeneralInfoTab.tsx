'use client';

import { Building2, Mail, Phone, Globe, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColorPicker } from './ColorPicker';
import { ConfigurationFormProps } from './configuration.types';

interface GeneralInfoTabProps extends ConfigurationFormProps {}

export function GeneralInfoTab({
  register,
  watch,
  setValue,
  errors,
}: GeneralInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Identidad Corporativa */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Identidad Corporativa
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Informacion basica de la institucion
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="companyName"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Nombre de la Empresa
                </Label>
                <Badge
                  variant="outline"
                  className="text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                >
                  Requerido
                </Badge>
              </div>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Ej: Municipalidad Provincial"
                aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                aria-invalid={!!errors.companyName}
                className={errors.companyName ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.companyName && (
                <p id="companyName-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor="companyTagline"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tagline / Lema
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                        aria-label="Ayuda sobre Tagline"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Frase breve que describe la institucion</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="companyTagline"
                {...register('companyTagline')}
                placeholder="Ej: Modernizando la gestion publica"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="websiteUrl"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Globe className="w-4 h-4 inline mr-1.5" />
                Sitio Web
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                {...register('websiteUrl')}
                placeholder="https://www.empresa.gob.pe"
                aria-describedby={errors.websiteUrl ? 'websiteUrl-error' : undefined}
                aria-invalid={!!errors.websiteUrl}
                className={errors.websiteUrl ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.websiteUrl && (
                <p id="websiteUrl-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacion de Contacto */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Informacion de Contacto
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Datos de contacto institucional
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="companyEmail"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Mail className="w-4 h-4 inline mr-1.5" />
                Email Corporativo
              </Label>
              <Input
                id="companyEmail"
                type="email"
                {...register('companyEmail')}
                placeholder="contacto@empresa.gob.pe"
                aria-describedby={errors.companyEmail ? 'companyEmail-error' : undefined}
                aria-invalid={!!errors.companyEmail}
                className={errors.companyEmail ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.companyEmail && (
                <p id="companyEmail-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.companyEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="supportEmail"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Mail className="w-4 h-4 inline mr-1.5" />
                Email de Soporte
              </Label>
              <Input
                id="supportEmail"
                type="email"
                {...register('supportEmail')}
                placeholder="soporte@empresa.gob.pe"
                aria-describedby={errors.supportEmail ? 'supportEmail-error' : undefined}
                aria-invalid={!!errors.supportEmail}
                className={errors.supportEmail ? 'border-red-500 dark:border-red-400' : ''}
              />
              {errors.supportEmail && (
                <p id="supportEmail-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.supportEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contactPhone"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Phone className="w-4 h-4 inline mr-1.5" />
                Telefono de Contacto
              </Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="+51 1 234-5678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalizacion */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-950">
              <svg
                className="w-5 h-5 text-violet-600 dark:text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Personalizacion
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Colores de la interfaz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ColorPicker
              id="primaryColor"
              label="Color Primario"
              value={watch('primaryColor')}
              onChange={(color) => setValue('primaryColor', color, { shouldDirty: true })}
              helpText="Este color se aplicara en botones principales, enlaces y elementos destacados."
            />

            <ColorPicker
              id="accentColor"
              label="Color Secundario"
              value={watch('accentColor')}
              onChange={(color) => setValue('accentColor', color, { shouldDirty: true })}
              helpText="Color para acentos, iconos secundarios y detalles visuales."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
