'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFirma } from '@/hooks/useFirma';
import { SignerSelector } from './SignerSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { documentsApi } from '@/lib/api/documents';
import { Document } from '@/types/document.types';
import { toast } from 'sonner';

interface CreateSignatureFlowFormProps {
  onFlowCreated?: () => void;
  initialDocumentId?: string;
}

export function CreateSignatureFlowForm({ onFlowCreated, initialDocumentId }: CreateSignatureFlowFormProps) {
  const [flowName, setFlowName] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(initialDocumentId);
  const [signers, setSigners] = useState<Array<{ userId: string; order: number }>>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const { createFlow, loading } = useFirma();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await documentsApi.getAll({ page: 1, limit: 100 });
        const documentsData = response.data.data?.documents || response.data.data || [];
        setAvailableDocuments(documentsData);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
        toast.error('No se pudieron cargar los documentos disponibles.');
      }
    };
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowName.trim() || !selectedDocumentId || signers.length === 0) {
      toast.error('Por favor, complete todos los campos y añada al menos un firmante.');
      return;
    }
    await createFlow(selectedDocumentId, flowName, signers);
    if (onFlowCreated) {
      onFlowCreated();
    }
    // Reset form
    setFlowName('');
    setSelectedDocumentId(undefined);
    setSigners([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Crear Nuevo Flujo de Firma</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="flowName" className="text-sm font-medium text-slate-900 dark:text-slate-200">Nombre del Flujo</Label>
            <Input
              id="flowName"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Ej: Flujo de Aprobación de Contrato"
              className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <Label htmlFor="document" className="text-sm font-medium text-slate-900 dark:text-slate-200">Documento a Firmar</Label>
            <Select onValueChange={setSelectedDocumentId} value={selectedDocumentId}>
              <SelectTrigger id="document" className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Seleccionar documento" />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.documentNumber} - {doc.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SignerSelector onSignersChange={setSigners} />
          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700">
            {loading ? 'Creando...' : 'Crear Flujo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
