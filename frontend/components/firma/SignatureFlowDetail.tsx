'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { SignatureFlow, SignerFlowData } from '@/types/signature.types';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { FileText, Calendar, User, CheckCircle2, Clock, XCircle, PenTool, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SignatureFlowDetailProps {
  flow: SignatureFlow;
  onSignDocument: (documentId: string, flowId: string) => void;
  onCancelFlow: (flowId: string) => void;
  loading: boolean;
}

export function SignatureFlowDetail({ flow, onSignDocument, onCancelFlow, loading }: SignatureFlowDetailProps) {
  const { user } = useAuthStore();
  const signers = flow.signers as SignerFlowData[];
  
  const currentStepSigner = signers[flow.currentStep];
  const isCurrentSigner = user && currentStepSigner?.userId === user.id && currentStepSigner?.status !== 'SIGNED';
  
  const canCancel = user && flow.createdBy.id === user.id;
  const isActiveFlow = flow.status === 'PENDING' || flow.status === 'IN_PROGRESS';

  const signedCount = signers.filter(s => s.status === 'SIGNED').length;
  const progressPercent = signers.length > 0 ? Math.round((signedCount / signers.length) * 100) : 0;

  const getSignerStatusIcon = (status: SignerFlowData['status']) => {
    switch (status) {
      case 'SIGNED': return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'PENDING': return <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default: return <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />;
    }
  };

  const getInitials = (user?: { fullName?: string; firstName?: string; lastName?: string; }) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.fullName) {
      const parts = user.fullName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado con estado */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
            {flow.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ID: {flow.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={flow.status} />
      </div>

      {/* Informacion del flujo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Documento</p>
              <Link 
                href={`/dashboard/archivo/documentos/${flow.document.id}`} 
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium 
                           transition-colors hover:text-blue-700 dark:hover:text-blue-300"
              >
                {flow.document.documentNumber}
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {flow.document.fileName}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Creado Por</p>
              <p className="text-slate-900 dark:text-slate-100">
                {flow.createdBy.firstName && flow.createdBy.lastName
                  ? `${flow.createdBy.firstName} ${flow.createdBy.lastName}`
                  : flow.createdBy.username || 'Usuario'}
              </p>
              {flow.createdBy.username && (
                <p className="text-sm text-slate-500 dark:text-slate-400">@{flow.createdBy.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fecha de Creacion</p>
              <p className="text-slate-900 dark:text-slate-100">{formatDateTime(flow.createdAt)}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Progreso del Flujo</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {signedCount} de {signers.length} firmantes
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      <Separator className="dark:bg-slate-700" />

      {/* Timeline de firmantes */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Firmantes y Timeline
        </h3>
        
        <div className="relative space-y-3">
          {signers.map((signer, index) => {
            const isCurrentStep = index === flow.currentStep && isActiveFlow;
            const isUserSigner = user && signer.userId === user.id;
            
            return (
              <div key={signer.userId} className="relative">
                {/* Linea conectora */}
                {index < signers.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-[-12px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                )}
                
                <div 
                  className={`
                    relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200
                    ${isCurrentStep && isUserSigner 
                      ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm' 
                      : isCurrentStep 
                        ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                        : signer.status === 'SIGNED'
                          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div className="relative z-10">
                    <Avatar className={`h-10 w-10 border-2 ${
                      signer.status === 'SIGNED' ? 'border-emerald-500' : 
                      isCurrentStep ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      <AvatarFallback className={`
                        text-sm font-semibold
                        ${signer.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 
                          isCurrentStep ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                      `}>
                        {getInitials(signer.user)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          <span className="text-slate-500 dark:text-slate-400 mr-1">{index + 1}.</span>
                          {signer.user?.fullName || signer.userId}
                        </p>
                        {signer.user?.email && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{signer.user.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getSignerStatusIcon(signer.status)}
                      </div>
                    </div>

                    {/* Fecha de firma */}
                    {signer.signedAt && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Firmado el {formatDateTime(signer.signedAt)}
                      </p>
                    )}

                    {/* Accion para firmar */}
                    {isCurrentStep && isUserSigner && signer.status !== 'SIGNED' && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          Es tu turno para firmar este documento
                        </p>
                        <Button 
                          onClick={() => onSignDocument(flow.documentId, flow.id)} 
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Preparando...
                            </>
                          ) : (
                            'Firmar Ahora'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Mensaje de ya firmado */}
                    {isUserSigner && signer.status === 'SIGNED' && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Ya has firmado este documento
                        </p>
                      </div>
                    )}

                    {/* Esperando firma */}
                    {isCurrentStep && !isUserSigner && (
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-2 font-medium">
                        Esperando firma de este usuario
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accion de cancelar */}
      {canCancel && isActiveFlow && (
        <>
          <Separator className="dark:bg-slate-700" />
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onCancelFlow(flow.id)} 
              disabled={loading}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 
                         dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar Flujo de Firma
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
