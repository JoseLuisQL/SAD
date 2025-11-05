import { useState, useEffect } from 'react';
import { firmaApi } from '@/lib/api/firma';
import { useAuthStore } from '@/store/authStore';
import { useConfigurationStore } from '@/store/configurationStore';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { SignatureFlow } from '@/types/signature.types';

declare global {
  interface Window {
    jQuery: any;
    jqFirmaPeru: any;
    startSignature: (port: number, paramBase64: string) => void;
    signatureInit: () => void;
    signatureOk: (response: any) => void;
    signatureCancel: () => void;
  }
}

type ProgressState = 'idle' | 'preparing' | 'initiated' | 'completed' | 'error';

export function useFirma() {
  const [loading, setLoading] = useState(false);
  const [flows, setFlows] = useState<SignatureFlow[]>([]);
  const [pendingFlows, setPendingFlows] = useState<SignatureFlow[]>([]);
  const [progressState, setProgressState] = useState<ProgressState>('idle');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const { user } = useAuthStore();
  const { config, fetchConfig } = useConfigurationStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const loadJQuery = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Si jQuery ya está cargado, configurar jqFirmaPeru y resolver
      if (window.jQuery) {
        window.jqFirmaPeru = window.jQuery.noConflict(true);
        console.log('jQuery ya estaba cargado, jqFirmaPeru configurado');
        resolve();
        return;
      }

      // Si el script ya existe pero aún no se ha cargado
      if (document.getElementById('jquery-script')) {
        const checkJQuery = setInterval(() => {
          if (window.jQuery) {
            clearInterval(checkJQuery);
            window.jqFirmaPeru = window.jQuery.noConflict(true);
            console.log('jQuery detectado después de espera, jqFirmaPeru configurado');
            resolve();
          }
        }, 100);
        return;
      }

      // Cargar jQuery desde CDN
      const script = document.createElement('script');
      script.id = 'jquery-script';
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.integrity = 'sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        if (window.jQuery) {
          window.jqFirmaPeru = window.jQuery.noConflict(true);
          console.log('jQuery 3.6.0 cargado exitosamente, jqFirmaPeru configurado');
          resolve();
        } else {
          reject(new Error('jQuery se cargó pero no está disponible en window'));
        }
      };
      script.onerror = () => {
        reject(new Error('Error al cargar jQuery desde CDN'));
      };
      document.head.appendChild(script);
    });
  };

  const loadFirmaPeruScript = async (clientWebUrl: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (document.getElementById('firmaperu-script')) {
        console.log('Script de Firma Perú ya estaba cargado');
        resolve();
        return;
      }

      // Verificar que jqFirmaPeru esté disponible antes de cargar el script
      if (!window.jqFirmaPeru) {
        reject(new Error('jqFirmaPeru no está disponible. jQuery debe cargarse primero.'));
        return;
      }

      const script = document.createElement('script');
      script.id = 'firmaperu-script';
      script.src = clientWebUrl;
      script.async = true;
      script.onload = () => {
        console.log('Script de Firma Perú cargado exitosamente');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Error al cargar el script de Firma Perú'));
      };
      document.body.appendChild(script);
    });
  };

  const signDocument = async (
    documentId: string,
    signatureReason: string,
    imageToStamp?: string,
    flowId?: string,
    onSuccessCallback?: () => void
  ) => {
    if (!user) {
      toast.error('Debe iniciar sesión para firmar documentos.');
      return;
    }

    setLoading(true);
    setProgressState('preparing');
    setProgressMessage('Preparando proceso de firma...');

    // Check if signature stamp is enabled and use configured stamp
    let finalImageToStamp = imageToStamp;
    if (config?.signatureStampEnabled && config?.stampUrl) {
      finalImageToStamp = config.stampUrl;
      console.log('✅ Usando stamp configurado:', finalImageToStamp);
    } else if (config?.signatureStampEnabled === false) {
      console.log('⚠️ El sello de firma está desactivado en la configuración');
      toast.warning('El sello de firma está desactivado en la configuración del sistema');
    }

    try {
      // Obtener configuración del componente web
      const configResponse = await firmaApi.getFirmaPeruConfig();
      const { clientWebUrl, localServerPort } = configResponse.data.data;

      // Cargar jQuery primero (si no está cargado)
      setProgressMessage('Cargando componentes necesarios...');
      await loadJQuery();

      // Cargar el script del componente web después de jQuery
      await loadFirmaPeruScript(clientWebUrl);

      // Crear el div requerido por el componente web
      let addComponentDiv = document.getElementById('addComponent');
      if (!addComponentDiv) {
        addComponentDiv = document.createElement('div');
        addComponentDiv.id = 'addComponent';
        addComponentDiv.style.display = 'none';
        document.body.appendChild(addComponentDiv);
      }

      // Definir las funciones callback globales que el componente web invocará
      window.signatureInit = () => {
        console.log('Firma Perú: Proceso de firma iniciado.');
        setProgressState('initiated');
        setProgressMessage('Proceso de firma iniciado. Por favor, complete la firma en el componente web.');
        toast.info('Iniciando proceso de firma digital...');
      };

      window.signatureOk = (response: any) => {
        console.log('Firma Perú: Documento firmado exitosamente.', response);
        setProgressState('completed');
        setProgressMessage('Documento firmado exitosamente.');
        toast.success('Documento firmado digitalmente.');
        setLoading(false);
        
        // Si hay un callback de éxito, ejecutarlo
        if (onSuccessCallback) {
          setTimeout(() => {
            onSuccessCallback();
          }, 1000); // Dar tiempo para que el toast se muestre
        }
      };

      window.signatureCancel = () => {
        console.log('Firma Perú: Proceso de firma cancelado.');
        setProgressState('error');
        setProgressMessage('Proceso de firma cancelado por el usuario.');
        toast.error('Proceso de firma cancelado.');
        setLoading(false);
      };

      // Obtener el token de un solo uso del backend
      setProgressMessage('Generando credenciales de seguridad...');
      console.log('📤 Solicitando token de un solo uso...');
      const tokenResponse = await firmaApi.getSignatureParams(
        documentId,
        signatureReason,
        finalImageToStamp,
        flowId
      );
      const { oneTimeToken } = tokenResponse.data.data;
      console.log('✅ Token de un solo uso recibido:', oneTimeToken.substring(0, 20) + '...');

      // Construir el objeto param para startSignature
      const paramObject = {
        param_url: `${API_URL}/firma/params`,
        param_token: oneTimeToken,
        document_extension: 'pdf',
      };

      console.log('📦 paramObject construido:', {
        param_url: paramObject.param_url,
        param_token: paramObject.param_token.substring(0, 20) + '...',
        document_extension: paramObject.document_extension
      });

      const paramBase64 = btoa(JSON.stringify(paramObject));
      console.log('🔐 paramBase64 (primeros 50 chars):', paramBase64.substring(0, 50) + '...');

      // Llamar a la función global startSignature del componente web
      if (typeof window.startSignature === 'function') {
        setProgressMessage('Iniciando componente de firma...');
        console.log('🚀 Llamando a window.startSignature...');
        window.startSignature(localServerPort, paramBase64);
      } else {
        throw new Error('La función startSignature del componente web de Firma Perú no está disponible.');
      }
    } catch (error: any) {
      console.error('Error al iniciar la firma:', error);
      setProgressState('error');
      setProgressMessage(error.message || 'Error al iniciar el proceso de firma.');
      toast.error(error.message || 'Error al iniciar el proceso de firma.');
      setLoading(false);
    }
  };

  const fetchAllFlows = async (filters?: any) => {
    setLoading(true);
    try {
      const response = await firmaApi.getAllSignatureFlows(filters);
      setFlows(response.data.data.flows);
    } catch (error) {
      console.error('Error al cargar flujos de firma:', error);
      toast.error('No se pudieron cargar los flujos de firma.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFlows = async () => {
    setLoading(true);
    try {
      const response = await firmaApi.getPendingSignatureFlows();
      setPendingFlows(response.data.data);
    } catch (error) {
      console.error('Error al cargar flujos pendientes:', error);
      toast.error('No se pudieron cargar los flujos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (documentId: string, name: string, signers: Array<{ userId: string; order: number }>) => {
    setLoading(true);
    try {
      await firmaApi.createSignatureFlow(documentId, name, signers);
      toast.success('Flujo de firma creado exitosamente.');
      fetchAllFlows();
    } catch (error: any) {
      console.error('Error al crear flujo de firma:', error);
      toast.error(error.response?.data?.message || 'Error al crear el flujo de firma.');
    } finally {
      setLoading(false);
    }
  };

  const cancelFlow = async (flowId: string) => {
    setLoading(true);
    try {
      await firmaApi.cancelSignatureFlow(flowId);
      toast.success('Flujo de firma cancelado.');
      fetchAllFlows();
    } catch (error: any) {
      console.error('Error al cancelar flujo de firma:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar el flujo de firma.');
    } finally {
      setLoading(false);
    }
  };

  return { 
    signDocument, 
    loading,
    progressState,
    progressMessage,
    flows, 
    pendingFlows, 
    fetchAllFlows, 
    fetchPendingFlows, 
    createFlow, 
    cancelFlow 
  };
}
