'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { SignatureFlow } from '@/types/signature.types';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Eye, XCircle, Calendar, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SignatureFlowWithProgress extends SignatureFlow {
  progressPercent?: number;
  signedCount?: number;
  totalSigners?: number;
}

interface SignatureFlowsTableProps {
  flows: SignatureFlowWithProgress[];
  onViewDetails: (flowId: string) => void;
  onCancelFlow: (flowId: string) => void;
  loading: boolean;
}

export function SignatureFlowsTable({ flows, onViewDetails, onCancelFlow, loading }: SignatureFlowsTableProps) {
  const { user } = useAuthStore();

  if (loading) {
    return <p className="text-slate-600 dark:text-slate-400 text-center py-8">Cargando flujos...</p>;
  }

  if (flows.length === 0) {
    return <p className="text-slate-600 dark:text-slate-400 text-center py-8">No hay flujos de firma disponibles.</p>;
  }

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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) {
      return '??';
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Nombre del Flujo</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Documento</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Creado Por</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Progreso</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Fecha</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow, index) => (
              <TableRow key={flow.id} className={`${index % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-900'} hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}>
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {flow.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-900 dark:text-slate-100">
                  <Link 
                    href={`/dashboard/archivo/documentos/${flow.document.id}`} 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {flow.document.documentNumber}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 truncate max-w-[200px]" title={flow.document.fileName}>
                    {flow.document.fileName}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                        {getInitials(flow.createdBy.firstName, flow.createdBy.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {flow.createdBy.firstName && flow.createdBy.lastName
                          ? `${flow.createdBy.firstName} ${flow.createdBy.lastName}`
                          : flow.createdBy.username || 'Usuario'}
                      </p>
                      {flow.createdBy.username && (
                        <p className="text-xs text-slate-500 dark:text-slate-500">{flow.createdBy.username}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 min-w-[120px]">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{flow.signedCount || 0} de {flow.totalSigners || flow.signers.length}</span>
                      <span className="font-medium">{flow.progressPercent || 0}%</span>
                    </div>
                    <Progress value={flow.progressPercent || 0} className="h-2 bg-slate-100 dark:bg-slate-700" />
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    {formatDate(flow.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(flow.status)}>
                    {getStatusLabel(flow.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(flow.id)} className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Ver Detalles</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles del flujo</TooltipContent>
                    </Tooltip>
                    {flow.status !== 'COMPLETED' && flow.status !== 'CANCELLED' && user?.id === flow.createdBy.id && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => onCancelFlow(flow.id)} className="gap-1.5">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Cancelar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancelar flujo de firma</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
