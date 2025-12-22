'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LoginForm from '@/components/forms/LoginForm';
import Image from 'next/image';
import { useConfigurationStore } from '@/store/configurationStore';

export default function LoginPage() {
  const { config, fetchConfig } = useConfigurationStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full rounded-2xl overflow-hidden">
      <CardHeader className="space-y-3 pb-4 px-8 pt-8">
        {/* Logo con animación sutil */}
        <div className="flex justify-center">
          {config?.logoUrl ? (
            <div className="relative w-16 h-16 transition-transform hover:scale-105">
              <Image
                src={config.logoUrl}
                alt={`Logo ${config.companyName || 'Empresa'}`}
                fill
                priority
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <span className="text-white text-3xl font-bold">
                {config?.companyName?.charAt(0) || 'S'}
              </span>
            </div>
          )}
        </div>

        {/* Encabezado simplificado */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Bienvenido
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingrese sus credenciales para continuar
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-8 pb-8">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
