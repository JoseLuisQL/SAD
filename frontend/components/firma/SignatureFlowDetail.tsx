'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { SignatureFlow, SignerFlowData } from '@/types/signature.types';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { FileText, Calendar, User, CheckCircle2, Clock, XCircle, PenTool } from 'lucide-react';

interface SignatureFlowDetailProps {
  flow: SignatureFlow;
  onSignDocument: (documentId: string, flowId: string) => void;
  onCancelFlow: (flowId: string) => void;
  loading: boolean;
}

export function SignatureFlowDetail({ flow, onSignDocument, onCancelFlow, loading }: SignatureFlowDetailProps) {
  const { user } = useAuthStore();
  const signers = flow.signers as SignerFlowData[];
  
  // Verificar si el usuario es el firmante actual Y si NO ha firmado ya
  const currentStepSigner = signers[flow.currentStep];
  const isCurrentSigner = user && currentStepSigner?.userId === user.id && currentStepSigner?.status !== 'SIGNED';
  
  const canCancel = user && flow.createdBy.id === user.id;
  const isActiveFlow = flow.status === 'PENDING' || flow.status === 'IN_PROGRESS';

  const signedCount = signers.filter(s => s.status === 'SIGNED').length;
  const progressPercent = signers.length > 0 ? Math.round((signedCount / signers.length) * 100) : 0;

  const getStatusBadgeVariant = (status: SignatureFlow['status']) => {
    switch (status) {
      case 'PENDING': return 'secondary' as const;
      case 'IN_PROGRESS': return 'default' as const;
      case 'COMPLETED': return 'default' as const;
      case 'CANCELLED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const getStatusLabel = (status: SignatureFlow['status']) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getSignerStatusIcon = (status: SignerFlowData['status']) => {
    switch (status) {
      case 'SIGNED': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'PENDING': return <Clock className="h-5 w-5 text-slate-400" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-slate-400" />;
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{flow.name}</CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                ID: {flow.id.substring(0, 8).toUpperCase()}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(flow.status)} className="text-sm px-3 py-1">
              {getStatusLabel(flow.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Documento</p>
                  <Link 
                    href={`/dashboard/archivo/documentos/${flow.document.id}`} 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {flow.document.documentNumber}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{flow.document.fileName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Creado Por</p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {flow.createdBy.firstName && flow.createdBy.lastName
                      ? `${flow.createdBy.firstName} ${flow.createdBy.lastName}`
                      : flow.createdBy.username || 'Usuario'}
                  </p>
                  {flow.createdBy.username && (
                    <p className="text-sm text-slate-500 dark:text-slate-500">{flow.createdBy.username}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Creación</p>
                  <p className="text-slate-900 dark:text-slate-100">{formatDateTime(flow.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Progreso del Flujo</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>{signedCount} de {signers.length} firmantes</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2.5 bg-slate-100 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          </div>

          <Separator className="dark:bg-slate-700" />

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Firmantes y Timeline
            </h3>
            
            <div className="relative space-y-4">
              {signers.map((signer, index) => {
                const isCurrentStep = index === flow.currentStep && isActiveFlow;
                const isUserSigner = user && signer.userId === user.id;
                
                return (
                  <div key={signer.userId} className="relative">
                    {index < signers.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                    )}
                    
                    <div 
                      className={`
                        relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all
                        ${isCurrentStep && isUserSigner 
                          ? 'border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-md' 
                          : isCurrentStep 
                            ? 'border-amber-500 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }
                      `}
                    >
                      <div className="relative z-10">
                        <Avatar className={`h-10 w-10 border-2 ${
                          signer.status === 'SIGNED' ? 'border-green-500' : 
                          isCurrentStep ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          <AvatarFallback className={`
                            text-sm font-semibold
                            ${signer.status === 'SIGNED' ? 'bg-green-100 text-green-700' : 
                              isCurrentStep ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                          `}>
                            {getInitials(signer.user)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {index + 1}. {signer.user?.fullName || `${signer.user?.firstName} ${signer.user?.lastName}` || signer.userId}
                            </p>
                            {signer.user?.email && (
                              <p className="text-sm text-slate-500 dark:text-slate-500">{signer.user.email}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getSignerStatusIcon(signer.status)}
                          </div>
                        </div>

                        {signer.signedAt && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Firmado el {formatDateTime(signer.signedAt)}
                          </p>
                        )}

                        {isCurrentStep && isUserSigner && signer.status !== 'SIGNED' && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                              Es tu turno para firmar este documento
                            </p>
                            <Button 
                              onClick={() => onSignDocument(flow.documentId, flow.id)} 
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                              {loading ? 'Preparando...' : 'Firmar Ahora'}
                            </Button>
                          </div>
                        )}
                        
                        {isUserSigner && signer.status === 'SIGNED' && (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              ✓ Ya has firmado este documento
                            </p>
                          </div>
                        )}

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

          {canCancel && isActiveFlow && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button variant="destructive" onClick={() => onCancelFlow(flow.id)} disabled={loading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Flujo de Firma
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
