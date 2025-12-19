'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SignatureFlowsTable } from '@/components/firma/SignatureFlowsTable';
import { SignatureFlowsFilters, SignatureFlowsFiltersData } from '@/components/firma/SignatureFlowsFilters';
import { CreateSignatureFlowForm } from '@/components/firma/CreateSignatureFlowForm';
import { SignatureFlowDetail } from '@/components/firma/SignatureFlowDetail';
import { StatsBar } from '@/components/firma/StatsBar';
import { CancelFlowDialog } from '@/components/firma/CancelFlowDialog';
import { SignatureFlow } from '@/types/signature.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { firmaApi } from '@/lib/api/firma';
import { Clock, Plus, HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function FlujosDeFirmaPage() {
  const [flows, setFlows] = useState<SignatureFlow[]>([]);
  const [pendingFlows, setPendingFlows] = useState<SignatureFlow[]>([]);
  const [metadata, setMetadata] = useState<{
    totalByStatus?: Record<string, number>;
    totalFlows?: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<SignatureFlow | null>(null);
  const [flowToCancel, setFlowToCancel] = useState<SignatureFlow | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SignatureFlowsFiltersData>({});
  const router = useRouter();
  const { startTour, resetTour } = useOnboarding();

  const fetchFlows = useCallback(async (filters: SignatureFlowsFiltersData = {}) => {
    try {
      setLoading(true);
      const response = await firmaApi.getAllSignatureFlows(filters);
      setFlows(response.data.data.flows);
      setMetadata(response.data.data.metadata || {});
    } catch (error) {
      console.error('Error al cargar flujos:', error);
      toast.error('Error al cargar flujos de firma');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingFlows = useCallback(async () => {
    try {
      const response = await firmaApi.getPendingSignatureFlows();
      setPendingFlows(response.data.data);
    } catch (error) {
      console.error('Error al cargar flujos pendientes:', error);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    fetchPendingFlows();
  }, [fetchFlows, fetchPendingFlows]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('refresh') === 'true') {
      fetchFlows(currentFilters);
      fetchPendingFlows();
      
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      window.history.replaceState({}, '', url.pathname + url.search);
      
      toast.success('Flujos actualizados correctamente');
    }
  }, [currentFilters, fetchFlows, fetchPendingFlows]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Nuevo flujo
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
      // Ctrl/Cmd + F = Enfocar busqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-flows')?.focus();
      }
      // Escape = Cerrar modales
      if (e.key === 'Escape') {
        if (flowToCancel) {
          setFlowToCancel(null);
        } else if (selectedFlow) {
          setSelectedFlow(null);
        } else if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flowToCancel, selectedFlow, isCreateModalOpen]);

  const handleFilterChange = (filters: SignatureFlowsFiltersData) => {
    setCurrentFilters(filters);
    fetchFlows(filters);
  };

  const handleViewDetails = async (flowId: string) => {
    try {
      const response = await firmaApi.getSignatureFlowById(flowId);
      setSelectedFlow(response.data.data);
    } catch (error) {
      console.error('Error al cargar detalles del flujo:', error);
      toast.error('No se pudieron cargar los detalles del flujo.');
    }
  };

  const handleRequestCancel = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      setFlowToCancel(flow);
    }
  };

  const handleConfirmCancel = async () => {
    if (!flowToCancel) return;
    
    try {
      setCancelLoading(true);
      await firmaApi.cancelSignatureFlow(flowToCancel.id);
      toast.success('Flujo cancelado exitosamente');
      setFlowToCancel(null);
      setSelectedFlow(null);
      fetchFlows(currentFilters);
      fetchPendingFlows();
    } catch (error: unknown) {
      console.error('Error al cancelar flujo:', error);
      const apiError = error as { message?: string; response?: { data?: { message?: string } } };
      const errorMessage = apiError?.message || apiError?.response?.data?.message || 'Error al cancelar el flujo';
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSignDocumentInFlow = (documentId: string, flowId: string) => {
    router.push(`/dashboard/firma/firmar?documentId=${documentId}&flowId=${flowId}`);
  };

  const handleFlowCreated = () => {
    setIsCreateModalOpen(false);
    fetchFlows(currentFilters);
    fetchPendingFlows();
    toast.success('Flujo creado exitosamente');
  };

  const handleStartTour = () => {
    resetTour('firma-flujos-tour');
    setTimeout(() => {
      startTour('firma-flujos-tour');
    }, 100);
  };

  const totalByStatus = metadata.totalByStatus || {};
  const inProgressCount = (totalByStatus.PENDING || 0) + (totalByStatus.IN_PROGRESS || 0);

  return (
    <TooltipProvider>
      <div className="px-4 lg:px-8 py-6 min-h-[calc(100vh-6rem)] space-y-5">
        {/* Header simplificado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-tour="firma-flujos-header">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Flujos de Firma
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona los procesos de firma digital de documentos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartTour}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Ayuda
                </Button>
              </TooltipTrigger>
              <TooltipContent>Iniciar tour guiado</TooltipContent>
            </Tooltip>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200
                                 hover:shadow-md active:scale-[0.98]" 
                      data-tour="firma-flujos-create"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Nuevo Flujo
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Crear nuevo flujo</span>
                  <kbd className="ml-2 px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">
                    Ctrl+N
                  </kbd>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-[700px] md:max-w-[750px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Crear Nuevo Flujo de Firma
                  </DialogTitle>
                </DialogHeader>
                <CreateSignatureFlowForm onFlowCreated={handleFlowCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barra de estadisticas compacta */}
        <div data-tour="firma-flujos-stats">
          <StatsBar
            totalFlows={metadata.totalFlows || 0}
            inProgress={inProgressCount}
            completed={totalByStatus.COMPLETED || 0}
            cancelled={totalByStatus.CANCELLED || 0}
          />
        </div>

        {/* Flujos pendientes del usuario */}
        {pendingFlows.length > 0 && (
          <Card 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 
                       border-blue-200 dark:border-blue-800/50 shadow-sm" 
            data-tour="firma-flujos-pending"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Mis Flujos Pendientes
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Tienes {pendingFlows.length} documento{pendingFlows.length !== 1 ? 's' : ''} esperando tu firma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingFlows.map(flow => (
                  <Card 
                    key={flow.id} 
                    className="p-4 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/50 
                               hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 
                               transition-all duration-200 cursor-pointer"
                    onClick={() => handleSignDocumentInFlow(flow.documentId, flow.id)}
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {flow.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Documento: <span className="font-medium">{flow.document.documentNumber}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                        {flow.document.fileName}
                      </p>
                      <Button 
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        Firmar Ahora
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div data-tour="firma-flujos-filters">
          <SignatureFlowsFilters onFilterChange={handleFilterChange} loading={loading} />
        </div>

        {/* Tabla de flujos */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm" data-tour="firma-flujos-table">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Todos los Flujos
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {flows.length} flujo{flows.length !== 1 ? 's' : ''} encontrado{flows.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <SignatureFlowsTable
              flows={flows}
              onViewDetails={handleViewDetails}
              onCancelFlow={handleRequestCancel}
              onCreateNew={() => setIsCreateModalOpen(true)}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Modal de detalles del flujo */}
        {selectedFlow && (
          <Dialog open={!!selectedFlow} onOpenChange={() => setSelectedFlow(null)}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Detalles del Flujo de Firma
                </DialogTitle>
              </DialogHeader>
              <SignatureFlowDetail
                flow={selectedFlow}
                onSignDocument={handleSignDocumentInFlow}
                onCancelFlow={handleRequestCancel}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de confirmacion de cancelacion */}
        <CancelFlowDialog
          flow={flowToCancel}
          open={!!flowToCancel}
          onOpenChange={(open) => !open && setFlowToCancel(null)}
          onConfirm={handleConfirmCancel}
          loading={cancelLoading}
        />
      </div>
    </TooltipProvider>
  );
}
