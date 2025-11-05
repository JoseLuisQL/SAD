'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

type TypologyType = 'office' | 'documentType' | 'period';

interface ImportPreviewTableProps {
  data: any[];
  validation: {
    valid: boolean;
    errors: Array<{ row: number; field: string; value: any; message: string }>;
    warnings: Array<{ row: number; field: string; value: any; message: string }>;
  };
  type: TypologyType;
}

export function ImportPreviewTable({ data, validation, type }: ImportPreviewTableProps) {
  const previewData = data.slice(0, 10);
  const totalRows = data.length;

  const getRequiredFields = () => {
    switch (type) {
      case 'office':
      case 'documentType':
        return ['name'];
      case 'period':
        return ['year'];
    }
  };

  const getOptionalFields = () => {
    switch (type) {
      case 'office':
      case 'documentType':
      case 'period':
        return ['description'];
    }
  };

  const requiredFields = getRequiredFields();
  const optionalFields = getOptionalFields();
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  const getColumnStatus = (columnName: string) => {
    if (requiredFields.includes(columnName)) return 'required';
    if (optionalFields.includes(columnName)) return 'optional';
    return 'extra';
  };

  const getColumnBadge = (columnName: string) => {
    const status = getColumnStatus(columnName);
    switch (status) {
      case 'required':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Requerido</Badge>;
      case 'optional':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><AlertCircle className="h-3 w-3 mr-1" /> Opcional</Badge>;
      default:
        return <Badge variant="outline">Extra</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-gray-900">
          Vista Previa de Importación
        </h3>
        <p className="text-sm text-gray-600">
          Mostrando {Math.min(10, totalRows)} de {totalRows} filas
        </p>
      </div>

      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            Errores de Validación ({validation.errors.length})
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
            {validation.errors.slice(0, 10).map((error, idx) => (
              <li key={idx}>Fila {error.row}: {error.message}</li>
            ))}
            {validation.errors.length > 10 && (
              <li className="text-red-600 font-medium">... y {validation.errors.length - 10} errores más</li>
            )}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Advertencias ({validation.warnings.length})
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
            {validation.warnings.slice(0, 5).map((warning, idx) => (
              <li key={idx}>Fila {warning.row}: {warning.message}</li>
            ))}
            {validation.warnings.length > 5 && (
              <li className="text-amber-600 font-medium">... y {validation.warnings.length - 5} advertencias más</li>
            )}
          </ul>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="min-w-[150px]">
                    <div className="space-y-2">
                      <span className="font-semibold">{col}</span>
                      {getColumnBadge(col)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col} className="font-mono text-sm">
                      {row[col] !== null && row[col] !== undefined && row[col] !== '' 
                        ? String(row[col]) 
                        : <span className="text-gray-400 italic">vacío</span>
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalRows > 10 && (
        <p className="text-sm text-gray-500 text-center">
          ... y {totalRows - 10} filas más
        </p>
      )}
    </div>
  );
}
