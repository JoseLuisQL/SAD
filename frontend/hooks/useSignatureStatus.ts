'use client';

import { useState, useEffect, useCallback } from 'react';
import { SignatureStatus } from '@/components/documents/SignatureStatusBadge';

interface SignerInfo {
  id: string;
  name: string;
  email: string;
  signedAt: Date;
  status: string;
  isReverted: boolean;
}

interface ActiveFlow {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextSigner?: string;
}

export interface DocumentSignatureStatus {
  documentId: string;
  status: SignatureStatus;
  totalSignatures: number;
  activeSignatures: number;
  revertedSignatures: number;
  activeFlows: ActiveFlow[];
  lastSignedAt: Date | null;
  lastSignedBy: string | null;
  signersInfo: SignerInfo[];
  hasActiveFlows: boolean;
}

interface UseSignatureStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSignatureStatus(
  documentId: string | null,
  options: UseSignatureStatusOptions = {}
) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const [status, setStatus] = useState<DocumentSignatureStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/firma/status/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estado de firma');
      }

      const data = await response.json();
      setStatus(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching signature status:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchStatus();

    if (autoRefresh && documentId) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, autoRefresh, refreshInterval, documentId]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus
  };
}

export function useBatchSignatureStatus(documentIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, {
    status: SignatureStatus;
    totalSignatures: number;
    lastSignedAt: Date | null;
  }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (documentIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/firma/status/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ documentIds })
      });

      if (!response.ok) {
        throw new Error('Error al obtener estados de firma');
      }

      const data = await response.json();
      const statusMap: Record<string, any> = {};
      
      data.data.forEach((item: any) => {
        statusMap[item.documentId] = {
          status: item.status,
          totalSignatures: item.totalSignatures,
          lastSignedAt: item.lastSignedAt
        };
      });

      setStatuses(statusMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching batch signature statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [documentIds]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return {
    statuses,
    loading,
    error,
    refetch: fetchStatuses
  };
}
