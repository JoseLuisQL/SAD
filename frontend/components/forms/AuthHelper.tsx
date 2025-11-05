'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Mail, Phone, Globe } from 'lucide-react';
import { useConfigurationStore } from '@/store/configurationStore';

export default function AuthHelper() {
  const { config, fetchConfig } = useConfigurationStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const supportEmail = config?.supportEmail || config?.companyEmail || 'soporte@disachincheros.gob.pe';
  const contactPhone = config?.contactPhone || '+51 999 999 999';
  const companyName = config?.companyName || 'DISA CHINCHEROS';
  const websiteUrl = config?.websiteUrl;

  return (
    <Card className="bg-gray-50 dark:bg-slate-800 border-dashed border-gray-300 dark:border-slate-600 shadow-none mt-6">
      <CardContent className="py-4 px-5">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-gray-600 dark:text-slate-400 mt-0.5 shrink-0" />
          <div className="space-y-3 text-sm">
            <p className="font-bold text-gray-900 dark:text-white">¿Necesitas ayuda?</p>
            <ul className="space-y-2 text-gray-800 dark:text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-gray-500 dark:text-slate-500 font-bold">•</span>
                <span className="font-medium">
                  Si olvidaste tu usuario o contraseña, contacta al 
                  administrador del sistema
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 dark:text-slate-500 font-bold">•</span>
                <span className="font-medium">
                  Para problemas de acceso, verifica tu conexión a internet 
                  e intenta nuevamente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 dark:text-slate-500 font-bold">•</span>
                <span className="font-medium">
                  Usa las credenciales proporcionadas por {companyName}
                </span>
              </li>
            </ul>
            
            <div className="pt-2 border-t border-gray-300 dark:border-slate-700">
              <p className="font-bold text-gray-900 dark:text-white mb-2">Soporte técnico:</p>
              <div className="space-y-2">
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex items-center gap-2 text-gray-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  aria-label="Enviar correo a soporte"
                >
                  <Mail className="h-4 w-4" />
                  <span className="underline">{supportEmail}</span>
                </a>
                <a
                  href={`tel:${contactPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-gray-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  aria-label="Llamar a soporte"
                >
                  <Phone className="h-4 w-4" />
                  <span className="underline">{contactPhone}</span>
                </a>
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    aria-label="Visitar sitio web"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="underline">Visitar sitio web</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
