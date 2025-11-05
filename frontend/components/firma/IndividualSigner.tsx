'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useFirma } from '@/hooks/useFirma';
import { Document } from '@/types/document.types';

interface IndividualSignerProps {
  document: Document;
  onSignatureComplete?: () => void;
  flowId?: string;
}

export function IndividualSigner({ document, onSignatureComplete, flowId }: IndividualSignerProps) {
  const [signatureReason, setSignatureReason] = useState('');
  const [useLogo, setUseLogo] = useState(false);
  const { signDocument, loading } = useFirma();

  const handleSign = async () => {
    if (!signatureReason.trim()) {
      alert('Por favor, ingrese una razón para la firma.');
      return;
    }
    
    // Si el usuario quiere usar logo, pasar la URL del logo (usar variable de entorno)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const logoUrl = useLogo ? `${apiUrl}/firma/assets/logo_firma.png` : undefined;
    
    await signDocument(document.id, signatureReason, logoUrl, flowId);
    
    if (onSignatureComplete) {
      onSignatureComplete();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-900">Firmar Documento Individualmente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="documentName" className="text-sm font-medium text-slate-900">Documento</Label>
          <Input id="documentName" value={document.fileName} readOnly className="mt-1" />
        </div>
        
        <div>
          <Label htmlFor="documentNumber" className="text-sm font-medium text-slate-900">Número de Documento</Label>
          <Input id="documentNumber" value={document.documentNumber} readOnly className="mt-1" />
        </div>

        <div>
          <Label htmlFor="sender" className="text-sm font-medium text-slate-900">Remitente</Label>
          <Input id="sender" value={document.sender} readOnly className="mt-1" />
        </div>

        <div>
          <Label htmlFor="signatureReason" className="text-sm font-medium text-slate-900">Razón de la Firma *</Label>
          <Textarea
            id="signatureReason"
            placeholder="Ej: 'Acepto los términos y condiciones' o 'Conformidad con el contenido'"
            value={signatureReason}
            onChange={(e) => setSignatureReason(e.target.value)}
            rows={3}
            required
            className="mt-1"
          />
          <p className="text-xs text-slate-600 mt-1">
            Este campo es obligatorio y se incluirá en los metadatos de la firma digital.
          </p>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Switch
            id="useLogo"
            checked={useLogo}
            onCheckedChange={setUseLogo}
          />
          <Label htmlFor="useLogo" className="cursor-pointer text-sm text-slate-900">
            Incluir logo institucional en la firma
          </Label>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold mb-3 text-slate-900">Información del Documento</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-slate-900">Tipo:</span> <span className="text-slate-600">{document.documentType.name}</span>
            </div>
            <div>
              <span className="font-medium text-slate-900">Oficina:</span> <span className="text-slate-600">{document.office.name}</span>
            </div>
            <div>
              <span className="font-medium text-slate-900">Fecha:</span> <span className="text-slate-600">{new Date(document.documentDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-slate-900">Folios:</span> <span className="text-slate-600">{document.folioCount}</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSign} disabled={loading} className="w-full">
          {loading ? 'Firmando...' : 'Firmar Documento'}
        </Button>

        <div className="text-xs text-slate-700 p-3 bg-amber-50 rounded border border-amber-200">
          <p className="font-medium mb-1 text-amber-900">Nota importante:</p>
          <p className="text-slate-600">
            Al hacer clic en &quot;Firmar Documento&quot;, se abrirá el componente de Firma Perú 
            que le permitirá seleccionar su certificado digital y firmar el documento. 
            Asegúrese de tener su token USB conectado y los drivers instalados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
