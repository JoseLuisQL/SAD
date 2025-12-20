'use client';

import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Sliders, Stamp, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SystemConfig } from '@/types/configuration.types';
import { GeneralConfigFormData } from './configuration.types';

interface SystemPreferencesTabProps {
  config: SystemConfig | null;
  watch: UseFormWatch<GeneralConfigFormData>;
  setValue: UseFormSetValue<GeneralConfigFormData>;
}

export function SystemPreferencesTab({
  config,
  watch,
  setValue,
}: SystemPreferencesTabProps) {
  const signatureStampEnabled = watch('signatureStampEnabled');
  const maintenanceMode = watch('maintenanceMode');

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-950">
              <Sliders className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Preferencias del Sistema
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Controla funcionalidades criticas del sistema
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sello en Firmas Digitales */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 mt-0.5">
                    <Stamp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor="signatureStampEnabled"
                        className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                      >
                        Sello en Firmas Digitales
                      </Label>
                      <Badge
                        className={
                          signatureStampEnabled
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }
                      >
                        {signatureStampEnabled ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Estampa automaticamente el logo institucional en documentos firmados digitalmente
                    </p>
                  </div>
                </div>
                <Switch
                  id="signatureStampEnabled"
                  checked={signatureStampEnabled}
                  onCheckedChange={(checked) =>
                    setValue('signatureStampEnabled', checked, { shouldDirty: true })
                  }
                  aria-describedby="signatureStampEnabled-description"
                />
              </div>
            </div>

            {/* Modo Mantenimiento */}
            <div
              className={`p-4 border rounded-lg transition-colors ${
                maintenanceMode
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg mt-0.5 ${
                      maintenanceMode
                        ? 'bg-amber-200 dark:bg-amber-900'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        maintenanceMode
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor="maintenanceMode"
                        className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                      >
                        Modo Mantenimiento
                      </Label>
                      <Badge
                        className={
                          maintenanceMode
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        }
                      >
                        {maintenanceMode ? 'Mantenimiento' : 'Operativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Restringe el acceso al sistema excepto para administradores
                    </p>

                    {maintenanceMode && (
                      <div className="flex items-center gap-2 mt-3 p-2.5 bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-md">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          El sistema estara inaccesible para usuarios no administradores mientras este activo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onCheckedChange={(checked) =>
                    setValue('maintenanceMode', checked, { shouldDirty: true })
                  }
                  aria-describedby="maintenanceMode-description"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacion del Sistema */}
      {config && (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Informacion del Sistema
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Datos de ultima actualizacion
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ultima actualizacion
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(config.updatedAt).toLocaleString('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
