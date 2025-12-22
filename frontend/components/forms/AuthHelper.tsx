'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { useConfigurationStore } from '@/store/configurationStore';

export default function AuthHelper() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { config } = useConfigurationStore();

  const supportEmail = config?.supportEmail || config?.companyEmail || 'soporte@disachincheros.gob.pe';
  const contactPhone = config?.contactPhone || '+51 999 999 999';

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2"
        aria-expanded={isExpanded}
        aria-controls="help-panel"
      >
        ¿Necesitas ayuda?
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isExpanded && (
        <div 
          id="help-panel"
          className="mt-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Si olvidaste tus credenciales, contacta al administrador:
          </p>
          <div className="space-y-2">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              aria-label="Enviar correo a soporte"
            >
              <Mail className="h-4 w-4" />
              {supportEmail}
            </a>
            <a
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              aria-label="Llamar a soporte"
            >
              <Phone className="h-4 w-4" />
              {contactPhone}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
