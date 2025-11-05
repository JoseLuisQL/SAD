'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { firmaApi } from '@/lib/api/firma';
import { toast } from 'sonner';
import { SignerFlowData } from '@/types/signature.types';

export default function FlujosRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.id as string;

  useEffect(() => {
    const redirectToCorrectPage = async () => {
      try {
        const response = await firmaApi.getSignatureFlowById(flowId);
        const flow = response.data.data;

        if (!flow) {
          toast.error('Flujo no encontrado');
          router.replace('/dashboard/firma/flujos');
          return;
        }

        const currentUserPendingSignature = flow.signatures?.find(
          (sig: SignerFlowData) => !sig.signedAt && sig.order === flow.currentOrder
        );

        if (currentUserPendingSignature && flow.documentId) {
          router.replace(
            `/dashboard/firma/firmar?documentId=${flow.documentId}&flowId=${flowId}`
          );
        } else {
          router.replace('/dashboard/firma/flujos');
        }
      } catch (error) {
        console.error('Error al obtener información del flujo:', error);
        toast.error('Error al cargar el flujo. Redirigiendo a la lista de flujos...');
        router.replace('/dashboard/firma/flujos');
      }
    };

    if (flowId) {
      redirectToCorrectPage();
    }
  }, [flowId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
