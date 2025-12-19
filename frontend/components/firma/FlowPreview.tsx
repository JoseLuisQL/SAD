'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSignature, User } from 'lucide-react';

interface Signer {
  userId: string;
  order: number;
  userFullName: string;
}

interface Document {
  documentNumber: string;
  fileName: string;
}

interface FlowPreviewProps {
  flowName: string;
  document: Document | null;
  signers: Signer[];
}

export function FlowPreview({ flowName, document, signers }: FlowPreviewProps) {
  if (!flowName || !document || signers.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <FileSignature className="h-4 w-4" />
          Vista Previa del Flujo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">{flowName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {document.documentNumber} - {document.fileName}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Orden de Firmas
          </p>
          <div className="pl-2 border-l-2 border-blue-300 dark:border-blue-600 space-y-2">
            {signers.map((signer, index) => (
              <div key={signer.userId} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 
                                flex items-center justify-center text-xs font-semibold
                                text-blue-700 dark:text-blue-300">
                  {index + 1}
                </div>
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {signer.userFullName}
                </span>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    Primer firmante
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
