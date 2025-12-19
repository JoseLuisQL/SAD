'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { SignatureFlow } from '@/types/signature.types';
import Link from 'next/link';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { 
  Eye, 
  XCircle, 
  FileText, 
  User, 
  MoreHorizontal,
  Plus,
  FileSignature
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from './StatusBadge';

interface SignatureFlowWithProgress extends SignatureFlow {
  progressPercent?: number;
  signedCount?: number;
  totalSigners?: number;
}

interface SignatureFlowsTableProps {
  flows: SignatureFlowWithProgress[];
  onViewDetails: (flowId: string) => void;
  onCancelFlow: (flowId: string) => void;
  onCreateNew?: () => void;
  loading: boolean;
}

export function SignatureFlowsTable({ 
  flows, 
  onViewDetails, 
  onCancelFlow, 
  onCreateNew,
  loading 
}: SignatureFlowsTableProps) {
  const { user } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando flujos...</p>
        </div>
      </div>
    );
  }

  if (flows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 
                        flex items-center justify-center mb-4">
          <FileSignature className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
          No hay flujos de firma
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
          Los flujos de firma permiten enviar documentos a multiples firmantes 
          en un orden especifico.
        </p>
        {onCreateNew && (
          <Button 
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Crear primer flujo
          </Button>
        )}
      </div>
    );
  }

  const formatRelativeDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Hace un momento' : `Hace ${diffMins} min`;
      }
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    }
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[300px]">
                Flujo
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[140px]">
                Progreso
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[120px]">
                Estado
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[120px]">
                Fecha
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[80px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => {
              const canCancel = user?.id === flow.createdBy.id && 
                flow.status !== 'COMPLETED' && 
                flow.status !== 'CANCELLED';

              return (
                <TableRow 
                  key={flow.id} 
                  className="group transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {/* Columna combinada: Nombre + Documento + Creador */}
                  <TableCell className="py-4">
                    <div className="space-y-1.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100 leading-tight">
                        {flow.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <Link 
                            href={`/dashboard/archivo/documentos/${flow.document.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                          >
                            {flow.document.documentNumber}
                          </Link>
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>
                            {flow.createdBy.firstName && flow.createdBy.lastName
                              ? `${flow.createdBy.firstName} ${flow.createdBy.lastName}`
                              : flow.createdBy.username || 'Usuario'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Progreso visual */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          {flow.signedCount || 0}/{flow.totalSigners || flow.signers.length}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {flow.progressPercent || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={flow.progressPercent || 0} 
                        className="h-1.5 bg-slate-100 dark:bg-slate-700"
                      />
                    </div>
                  </TableCell>
                  
                  {/* Estado con badge mejorado */}
                  <TableCell>
                    <StatusBadge status={flow.status} size="sm" />
                  </TableCell>
                  
                  {/* Fecha relativa con tooltip */}
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-slate-600 dark:text-slate-400 cursor-default">
                          {formatRelativeDate(flow.createdAt)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {formatFullDate(flow.createdAt)}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  {/* Acciones simplificadas */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity
                                     focus:opacity-100 data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewDetails(flow.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        {canCancel && (
                          <DropdownMenuItem 
                            onClick={() => onCancelFlow(flow.id)}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar flujo
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
