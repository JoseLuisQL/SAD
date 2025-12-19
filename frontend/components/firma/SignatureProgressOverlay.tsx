'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, CheckCircle2, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type ProgressState = 'idle' | 'preparing' | 'initiated' | 'completed' | 'error';

interface SignatureProgressOverlayProps {
  isVisible: boolean;
  state: ProgressState;
  message: string;
  onCancel: () => void;
}

function StepIndicator({ label, status }: { label: string; status: 'pending' | 'active' | 'completed' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${status === 'completed' ? 'bg-green-500' : ''}
        ${status === 'active' ? 'bg-blue-500 animate-pulse scale-125' : ''}
        ${status === 'pending' ? 'bg-slate-300 dark:bg-slate-600' : ''}
      `} />
      <span className={`
        text-sm transition-colors duration-300
        ${status === 'completed' ? 'text-slate-900 dark:text-white font-medium' : ''}
        ${status === 'active' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}
        ${status === 'pending' ? 'text-slate-400 dark:text-slate-500' : ''}
      `}>
        {label}
      </span>
      {status === 'completed' && (
        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
      )}
    </div>
  );
}

export function SignatureProgressOverlay({
  isVisible,
  state,
  message,
  onCancel,
}: SignatureProgressOverlayProps) {
  const progressValue = {
    idle: 0,
    preparing: 25,
    initiated: 60,
    completed: 100,
    error: 0,
  }[state];

  const stateConfig = {
    idle: {
      icon: Loader2,
      iconClass: 'text-slate-400',
      title: 'Iniciando...',
      ringClass: 'from-slate-400 to-slate-500',
    },
    preparing: {
      icon: Loader2,
      iconClass: 'animate-spin text-white',
      title: 'Preparando Firma Digital',
      ringClass: 'from-blue-500 to-indigo-600',
    },
    initiated: {
      icon: Shield,
      iconClass: 'animate-pulse text-white',
      title: 'Firmando Documento',
      ringClass: 'from-indigo-500 to-purple-600',
    },
    completed: {
      icon: CheckCircle2,
      iconClass: 'text-white',
      title: 'Firma Completada',
      ringClass: 'from-green-500 to-emerald-600',
    },
    error: {
      icon: XCircle,
      iconClass: 'text-white',
      title: 'Error en la Firma',
      ringClass: 'from-red-500 to-rose-600',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  const getStepStatus = (step: number): 'pending' | 'active' | 'completed' => {
    if (state === 'error') return 'pending';
    if (state === 'completed') return 'completed';
    if (state === 'preparing' && step === 1) return 'active';
    if (state === 'preparing' && step > 1) return 'pending';
    if (state === 'initiated' && step === 1) return 'completed';
    if (state === 'initiated' && step === 2) return 'active';
    if (state === 'initiated' && step === 3) return 'pending';
    return 'pending';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay oscuro con blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" 
          />
          
          {/* Contenedor central */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${config.ringClass} p-6 text-center`}>
                {/* Icono principal con anillos animados */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  {/* Anillos pulsantes */}
                  {state !== 'completed' && state !== 'error' && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-20 h-20 rounded-full bg-white/20"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute w-20 h-20 rounded-full bg-white/20"
                      />
                    </>
                  )}
                  
                  {/* Icono */}
                  <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <Icon className={`h-10 w-10 ${config.iconClass}`} />
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {config.title}
                </h3>
                <p className="text-sm text-white/80">
                  {message}
                </p>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Progreso</span>
                    <span className="font-medium">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>

                {/* Pasos del proceso */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <StepIndicator 
                    label="Preparando documento para firma" 
                    status={getStepStatus(1)} 
                  />
                  <StepIndicator 
                    label="Aplicando certificado digital" 
                    status={getStepStatus(2)} 
                  />
                  <StepIndicator 
                    label="Verificando integridad" 
                    status={getStepStatus(3)} 
                  />
                </div>

                {/* Advertencia */}
                <div className="flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Importante:</strong> No cierre esta ventana ni desconecte el token USB hasta que el proceso finalice.
                  </p>
                </div>

                {/* Botón cancelar */}
                {state !== 'completed' && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Proceso de Firma
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
