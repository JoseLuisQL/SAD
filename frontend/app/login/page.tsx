'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/forms/LoginForm';
import Image from 'next/image';
import { useConfigurationStore } from '@/store/configurationStore';

export default function LoginPage() {
  const { config, fetchConfig } = useConfigurationStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900 w-full">
      <CardHeader className="space-y-4 pb-6 px-8 pt-8">
        {/* Logo oficial */}
        <div className="flex justify-center">
          {config?.logoUrl ? (
            <div className="relative w-20 h-20">
              <Image
                src={config.logoUrl}
                alt={`Logo ${config.companyName || 'Empresa'}`}
                fill
                priority
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">
                {config?.companyName?.charAt(0) || 'D'}
              </span>
            </div>
          )}
        </div>

        {/* Encabezado */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Iniciar Sesión
          </h1>
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-slate-200 text-center">
            {config?.companyName || 'Sistema Integrado de Archivos Digitales'}
          </CardTitle>
          {config?.companyTagline && (
            <CardDescription className="text-sm text-gray-600 dark:text-slate-400 text-center">
              {config.companyTagline}
            </CardDescription>
          )}
        </div>

        {/* Texto de bienvenida */}
        <div className="pt-1">
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed text-center font-medium">
            Acceda de forma segura al sistema de gestión documental. 
            Toda la información es confidencial y está protegida bajo 
            estándares de seguridad institucionales.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-8 pb-8">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
