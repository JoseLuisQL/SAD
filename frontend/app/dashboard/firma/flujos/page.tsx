'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SignatureFlowsTable } from '@/components/firma/SignatureFlowsTable';
import { SignatureFlowsFilters, SignatureFlowsFiltersData } from '@/components/firma/SignatureFlowsFilters';
import { CreateSignatureFlowForm } from '@/components/firma/CreateSignatureFlowForm';
import { SignatureFlowDetail } from '@/components/firma/SignatureFlowDetail';
import { SignatureFlow } from '@/types/signature.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { firmaApi } from '@/lib/api/firma';
import { FileSignature, Clock, CheckCircle, XCircle, Plus, HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function FlujosDeFirmaPage() {
  const [flows, setFlows] = useState<SignatureFlow[]>([]);
  const [pendingFlows, setPendingFlows] = useState<SignatureFlow[]>([]);
  const [metadata, setMetadata] = useState<{
    totalByStatus?: Record<string, number>;
    totalFlows?: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<SignatureFlow | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SignatureFlowsFiltersData>({});
  const router = useRouter();
  const { startTour, resetTour } = useOnboarding();

  const fetchFlows = async (filters: SignatureFlowsFiltersData = {}) => {
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
  };

  const fetchPendingFlows = async () => {
    try {
      const response = await firmaApi.getPendingSignatureFlows();
      setPendingFlows(response.data.data);
    } catch (error) {
      console.error('Error al cargar flujos pendientes:', error);
    }
  };

  useEffect(() => {
    fetchFlows();
    fetchPendingFlows();
  }, []);

  // Detectar parámetro refresh en la URL para recargar automáticamente después de firmar
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('refresh') === 'true') {
      console.log('🔄 Detectado parámetro refresh, recargando flujos...');
      
      // Recargar flujos y flujos pendientes
      fetchFlows(currentFilters);
      fetchPendingFlows();
      
      // Limpiar el parámetro de la URL sin recargar la página
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      window.history.replaceState({}, '', url.pathname + url.search);
      
      toast.success('Flujos actualizados correctamente');
    }
  }, []);

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

  const handleCancelFlow = async (flowId: string) => {
    if (confirm('¿Está seguro de que desea cancelar este flujo de firma?')) {
      try {
        await firmaApi.cancelSignatureFlow(flowId);
        toast.success('Flujo cancelado exitosamente');
        setSelectedFlow(null);
        fetchFlows(currentFilters);
        fetchPendingFlows();
      } catch (error: unknown) {
        console.error('Error al cancelar flujo:', error);
        const apiError = error as { message?: string; response?: { data?: { message?: string } } };
        const errorMessage = apiError?.message || apiError?.response?.data?.message || 'Error al cancelar el flujo';
        toast.error(errorMessage);
      }
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

  return (
    <div className="px-6 lg:px-10 py-8 min-h-[calc(100vh-6rem)] space-y-6">
      <div className="flex items-center justify-between" data-tour="firma-flujos-header">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Gestión de Flujos de Firma</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Administra y crea flujos de firma digital</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartTour}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Iniciar Tour
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700" data-tour="firma-flujos-create">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Flujo
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Crear Nuevo Flujo de Firma</DialogTitle>
            </DialogHeader>
            <CreateSignatureFlowForm onFlowCreated={handleFlowCreated} />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="firma-flujos-stats">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-600 dark:text-slate-400">Total de Flujos</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              {metadata.totalFlows || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-600 dark:text-slate-400">En Progreso</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              {(totalByStatus.PENDING || 0) + (totalByStatus.IN_PROGRESS || 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-600 dark:text-slate-400">Completados</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              {totalByStatus.COMPLETED || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-600 dark:text-slate-400">Cancelados</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              {totalByStatus.CANCELLED || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {pendingFlows.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-sm" data-tour="firma-flujos-pending">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Mis Flujos Pendientes
            </CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-300">
              Tienes {pendingFlows.length} documento{pendingFlows.length !== 1 ? 's' : ''} esperando tu firma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingFlows.map(flow => (
                <Card key={flow.id} className="p-4 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{flow.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Documento: <span className="font-medium">{flow.document.documentNumber}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{flow.document.fileName}</p>
                    <Button 
                      onClick={() => handleSignDocumentInFlow(flow.documentId, flow.id)}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
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

      <div data-tour="firma-flujos-filters">
        <SignatureFlowsFilters onFilterChange={handleFilterChange} loading={loading} />
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm" data-tour="firma-flujos-table">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Todos los Flujos de Firma</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {flows.length} flujo{flows.length !== 1 ? 's' : ''} encontrado{flows.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignatureFlowsTable
            flows={flows}
            onViewDetails={handleViewDetails}
            onCancelFlow={handleCancelFlow}
            loading={loading}
          />
        </CardContent>
      </Card>

      {selectedFlow && (
        <Dialog open={!!selectedFlow} onOpenChange={() => setSelectedFlow(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Detalles del Flujo de Firma</DialogTitle>
            </DialogHeader>
            <SignatureFlowDetail
              flow={selectedFlow}
              onSignDocument={handleSignDocumentInFlow}
              onCancelFlow={handleCancelFlow}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
