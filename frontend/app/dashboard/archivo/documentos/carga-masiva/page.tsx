'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUploader from '@/components/documents/FileUploader';
import { FileListPanel, FileItem } from '@/components/archivo/documentos/FileListPanel';
import { useDocuments } from '@/hooks/useDocuments';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { DocumentMetadata } from '@/types/document.types';
import {
  generateCSVTemplate,
  downloadCSV,
  parseCSV,
  validateCSVRow,
  csvRowToMetadata,
} from '@/lib/utils/csvUtils';
import { toast } from 'sonner';

interface FileMetadata extends Partial<DocumentMetadata> {
  id: string;
  fileName: string;
}

export default function BatchUploadPage() {
  const router = useRouter();
  const { uploadBatch, loading } = useDocuments();
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [commonMetadata, setCommonMetadata] = useState({
    archivadorId: '',
  });
  const [filesMetadata, setFilesMetadata] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    results: Array<{ fileName: string; success: boolean; error?: string }>;
  } | null>(null);

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  // Update metadata when files change
  useEffect(() => {
    const newMetadata = fileItems.map((item) => {
      const existing = filesMetadata.find((m) => m.id === item.id);
      return (
        existing || {
          id: item.id,
          fileName: item.file.name,
          documentTypeId: '',
          officeId: '',
          documentNumber: '',
          documentDate: new Date().toISOString().split('T')[0],
          sender: '',
          folioCount: 1,
          annotations: '',
        }
      );
    });
    setFilesMetadata(newMetadata);
  }, [fileItems]);

  const handleFileChange = (files: File[]) => {
    const newItems: FileItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      status: 'pending',
    }));
    setFileItems(newItems);

    // Mark as ready after basic validation
    setTimeout(() => {
      setFileItems((prev) =>
        prev.map((item) => ({
          ...item,
          status: item.file.size > 50 * 1024 * 1024 ? 'error' : 'ready',
          error:
            item.file.size > 50 * 1024 * 1024
              ? 'Archivo excede 50 MB'
              : undefined,
        }))
      );
    }, 500);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
    setFilesMetadata((prev) => prev.filter((meta) => meta.id !== id));
  };

  const handleDownloadTemplate = () => {
    const fileNames = fileItems.map((item) => item.file.name);
    if (fileNames.length === 0) {
      toast.error('Primero selecciona archivos');
      return;
    }

    const csvContent = generateCSVTemplate(fileNames);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `plantilla-metadatos-${timestamp}.csv`);
    toast.success('Plantilla CSV descargada');
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);

        // Validate all rows
        const validationErrors: string[] = [];
        rows.forEach((row, index) => {
          const { valid, errors } = validateCSVRow(row);
          if (!valid) {
            validationErrors.push(`Fila ${index + 2}: ${errors.join(', ')}`);
          }
        });

        if (validationErrors.length > 0) {
          toast.error(
            `Errores en el CSV:\n${validationErrors.slice(0, 3).join('\n')}`
          );
          return;
        }

        // Apply metadata from CSV
        const updatedMetadata = filesMetadata.map((meta) => {
          const csvRow = rows.find((r) => r.fileName === meta.fileName);
          if (csvRow) {
            return {
              ...meta,
              ...csvRowToMetadata(csvRow),
            };
          }
          return meta;
        });

        setFilesMetadata(updatedMetadata);
        toast.success(`${rows.length} metadatos importados correctamente`);
      } catch (error) {
        console.error('Error al importar CSV:', error);
        toast.error('Error al procesar el archivo CSV');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const handleMetadataChange = (index: number, field: string, value: string | number) => {
    const newMetadata = [...filesMetadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setFilesMetadata(newMetadata);
  };

  const handleUpload = async () => {
    if (!commonMetadata.archivadorId) {
      toast.error('Selecciona un archivador');
      return;
    }

    const allValid = filesMetadata.every(
      (m) =>
        m.documentTypeId &&
        m.officeId &&
        m.documentNumber &&
        m.documentDate &&
        m.sender &&
        m.folioCount
    );

    if (!allValid) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Mark files as uploading
    setFileItems((prev) =>
      prev.map((item) => ({ ...item, status: 'uploading' }))
    );

    try {
      const files = fileItems.map((item) => item.file);
      const result = await uploadBatch(
        files,
        commonMetadata,
        filesMetadata.map(({ id, fileName, ...rest }) => rest)
      );

      // El backend retorna: { status, message, data: { total, successful, failed, successfulIds, errors } }
      const apiResponse = result as unknown as {
        status: string;
        message: string;
        data: {
          total: number;
          successful: number;
          failed: number;
          successfulIds: string[];
          errors: Array<{ fileName: string; error: string }>;
        };
      };

      const batchResult = apiResponse.data;

      // Update file statuses
      setFileItems((prev) =>
        prev.map((item) => {
          const hasError = (batchResult.errors || []).some(
            (e) => e.fileName === item.file.name
          );
          return {
            ...item,
            status: hasError ? 'error' : 'success',
            error: hasError
              ? batchResult.errors?.find((e) => e.fileName === item.file.name)?.error
              : undefined,
          };
        })
      );

      // Create results summary
      const results = [
        ...files
          .filter((file) => {
            return !(batchResult.errors || []).some((e) => e.fileName === file.name);
          })
          .map((file) => ({
            fileName: file.name,
            success: true as const,
          })),
        ...(batchResult.errors || []).map((error) => ({
          fileName: error.fileName,
          success: false as const,
          error: error.error,
        })),
      ];

      setUploadResults({
        successful: batchResult.successful || 0,
        failed: batchResult.failed || 0,
        results,
      });

      setUploadProgress(100);
      toast.success(
        `${batchResult.successful} documentos subidos correctamente${
          batchResult.failed > 0 ? `, ${batchResult.failed} errores` : ''
        }`
      );
    } catch (error: unknown) {
      console.error('Error en carga masiva:', error);
      const errorMessage =
        (error as { message?: string })?.message || 'Error desconocido en la carga masiva';
      toast.error('Error: ' + errorMessage);

      // Mark all as error
      setFileItems((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error',
          error: errorMessage,
        }))
      );
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setFilesMetadata([]);
    setUploadResults(null);
    setUploadProgress(0);
  };

  const handleFinish = () => {
    router.push('/dashboard/archivo/documentos');
  };

  if (uploadResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Resultado de Carga Masiva</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Exitosos</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {uploadResults.successful}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400 mr-3" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Fallidos</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{uploadResults.failed}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detalle por Archivo</h3>
            {uploadResults.results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
                }`}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                  )}
                  <span className="text-sm font-medium dark:text-white">{result.fileName}</span>
                </div>
                {!result.success && result.error && (
                  <span className="text-xs text-red-600 dark:text-red-400">{result.error}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Nueva Carga
            </Button>
            <Button onClick={handleFinish}>Ir a Documentos</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Carga Masiva de Documentos</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">Sube múltiples documentos al mismo tiempo</p>
      </div>

      <Card className="p-6 mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Seleccionar Archivos</h2>
        <FileUploader
          files={fileItems.map((item) => item.file)}
          onFilesChange={handleFileChange}
          maxFiles={50}
        />
      </Card>

      {fileItems.length > 0 && (
        <>
          <Card className="p-6 mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Metadatos Comunes</h2>
            <div className="space-y-2">
              <Label htmlFor="archivadorId" className="text-gray-900 dark:text-white font-semibold">
                Archivador <span className="text-red-500">*</span>
              </Label>
              <select
                id="archivadorId"
                value={commonMetadata.archivadorId}
                onChange={(e) =>
                  setCommonMetadata({ ...commonMetadata, archivadorId: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Selecciona un archivador</option>
                {archivadores.map((archivador) => (
                  <option key={archivador.id} value={archivador.id}>
                    {archivador.code} - {archivador.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Metadatos Específicos</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Archivo</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Tipo *</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Oficina *</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Número *</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Fecha *</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Remitente *</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Folios *</th>
                  </tr>
                </thead>
                <tbody>
                  {filesMetadata.map((meta, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="border border-gray-300 dark:border-slate-600 p-2 text-sm font-medium text-gray-900 dark:text-white">{meta.fileName}</td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <select
                          value={meta.documentTypeId}
                          onChange={(e) =>
                            handleMetadataChange(index, 'documentTypeId', e.target.value)
                          }
                          className="w-full p-1 text-sm border rounded bg-background text-foreground dark:border-slate-600"
                        >
                          <option value="">Seleccionar</option>
                          {documentTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <select
                          value={meta.officeId}
                          onChange={(e) =>
                            handleMetadataChange(index, 'officeId', e.target.value)
                          }
                          className="w-full p-1 text-sm border rounded bg-background text-foreground dark:border-slate-600"
                        >
                          <option value="">Seleccionar</option>
                          {offices.map((office) => (
                            <option key={office.id} value={office.id}>
                              {office.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <Input
                          value={meta.documentNumber}
                          onChange={(e) =>
                            handleMetadataChange(index, 'documentNumber', e.target.value)
                          }
                          className="text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <Input
                          type="date"
                          value={meta.documentDate}
                          onChange={(e) =>
                            handleMetadataChange(index, 'documentDate', e.target.value)
                          }
                          className="text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <Input
                          value={meta.sender}
                          onChange={(e) =>
                            handleMetadataChange(index, 'sender', e.target.value)
                          }
                          className="text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-slate-600 p-2">
                        <Input
                          type="number"
                          value={meta.folioCount}
                          onChange={(e) =>
                            handleMetadataChange(index, 'folioCount', parseInt(e.target.value))
                          }
                          min="1"
                          className="text-sm w-20"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? (
                <>Procesando...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Procesar Carga ({fileItems.length} archivos)
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
