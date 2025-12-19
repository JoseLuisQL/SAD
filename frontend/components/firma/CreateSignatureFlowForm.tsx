'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFirma } from '@/hooks/useFirma';
import { SignerSelector } from './SignerSelector';
import { FlowPreview } from './FlowPreview';
import { DocumentSelector } from './DocumentSelector';
import { Document } from '@/types/document.types';
import { toast } from 'sonner';
import { AlertCircle, FileSignature, Loader2 } from 'lucide-react';

interface CreateSignatureFlowFormProps {
  onFlowCreated?: () => void;
  initialDocumentId?: string;
}

interface FormErrors {
  flowName?: string;
  document?: string;
  signers?: string;
}

interface SelectedSigner {
  userId: string;
  order: number;
  userFullName: string;
}

export function CreateSignatureFlowForm({ onFlowCreated, initialDocumentId }: CreateSignatureFlowFormProps) {
  const [flowName, setFlowName] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(initialDocumentId);
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();
  const [signers, setSigners] = useState<SelectedSigner[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { createFlow, loading } = useFirma();

  const validateField = (field: string, value: string | SelectedSigner[] | undefined) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'flowName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.flowName = 'El nombre del flujo es requerido';
        } else if (typeof value === 'string' && value.length < 3) {
          newErrors.flowName = 'Minimo 3 caracteres';
        } else if (typeof value === 'string' && value.length > 100) {
          newErrors.flowName = 'Maximo 100 caracteres';
        } else {
          delete newErrors.flowName;
        }
        break;
      case 'document':
        if (!value) {
          newErrors.document = 'Selecciona un documento';
        } else {
          delete newErrors.document;
        }
        break;
      case 'signers':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors.signers = 'Agrega al menos un firmante';
        } else {
          delete newErrors.signers;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    switch (field) {
      case 'flowName':
        validateField('flowName', flowName);
        break;
      case 'document':
        validateField('document', selectedDocumentId);
        break;
      case 'signers':
        validateField('signers', signers);
        break;
    }
  };

  const handleDocumentChange = (documentId: string | undefined, document: Document | undefined) => {
    setSelectedDocumentId(documentId);
    setSelectedDocument(document);
    if (touched.document) {
      validateField('document', documentId);
    }
  };

  const handleSignersChange = (newSigners: Array<{ userId: string; order: number }>) => {
    const signersWithNames = newSigners.map(s => {
      const existing = signers.find(es => es.userId === s.userId);
      return existing || { ...s, userFullName: '' };
    });
    setSigners(signersWithNames as SelectedSigner[]);
    if (touched.signers) {
      validateField('signers', signersWithNames as SelectedSigner[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ flowName: true, document: true, signers: true });
    
    const isFlowNameValid = validateField('flowName', flowName);
    const isDocumentValid = validateField('document', selectedDocumentId);
    const isSignersValid = validateField('signers', signers);

    if (!isFlowNameValid || !isDocumentValid || !isSignersValid) {
      toast.error('Por favor, corrige los errores del formulario.');
      return;
    }

    if (!selectedDocumentId) return;

    await createFlow(
      selectedDocumentId, 
      flowName, 
      signers.map(s => ({ userId: s.userId, order: s.order }))
    );
    
    if (onFlowCreated) {
      onFlowCreated();
    }
    
    setFlowName('');
    setSelectedDocumentId(undefined);
    setSelectedDocument(undefined);
    setSigners([]);
    setTouched({});
    setErrors({});
  };

  const isFormValid = flowName.trim().length >= 3 && selectedDocumentId && signers.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del Flujo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="flowName" className="text-sm font-medium text-slate-900 dark:text-slate-200">
            Nombre del Flujo <span className="text-red-500">*</span>
          </Label>
          {touched.flowName && errors.flowName && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.flowName}
            </span>
          )}
        </div>
        <Input
          id="flowName"
          value={flowName}
          onChange={(e) => {
            setFlowName(e.target.value);
            if (touched.flowName) {
              validateField('flowName', e.target.value);
            }
          }}
          onBlur={() => handleBlur('flowName')}
          placeholder="Ej: Aprobacion Contrato 2024"
          className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                     ${touched.flowName && errors.flowName 
                       ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                       : 'focus:ring-blue-500 focus:border-blue-500'}`}
          aria-invalid={touched.flowName && !!errors.flowName}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Un nombre descriptivo para identificar este flujo de firma
        </p>
      </div>

      {/* Documento a Firmar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
            Documento a Firmar <span className="text-red-500">*</span>
          </Label>
          {touched.document && errors.document && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.document}
            </span>
          )}
        </div>
        <DocumentSelector
          value={selectedDocumentId}
          onChange={handleDocumentChange}
          onBlur={() => handleBlur('document')}
          error={touched.document && !!errors.document}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Busca por numero de documento o nombre de archivo
        </p>
      </div>

      {/* Selector de Firmantes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">
            Firmantes <span className="text-red-500">*</span>
          </Label>
          {touched.signers && errors.signers && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.signers}
            </span>
          )}
        </div>
        <SignerSelector 
          onSignersChange={handleSignersChange}
          onBlur={() => handleBlur('signers')}
        />
      </div>

      {/* Vista Previa */}
      {isFormValid && selectedDocument && (
        <FlowPreview
          flowName={flowName}
          document={{
            documentNumber: selectedDocument.documentNumber,
            fileName: selectedDocument.fileName
          }}
          signers={signers}
        />
      )}

      {/* Boton de envio */}
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={loading || !isFormValid} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all duration-200 h-11"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando flujo...
            </>
          ) : (
            <>
              <FileSignature className="h-4 w-4 mr-2" />
              Crear Flujo de Firma
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
