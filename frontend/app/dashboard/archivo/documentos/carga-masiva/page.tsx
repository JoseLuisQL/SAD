'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
  Loader2,
  FileText,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FileUploader from '@/components/documents/FileUploader';
import PDFPreview from '@/components/documents/PDFPreview';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { useDocuments } from '@/hooks/useDocuments';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { DocumentMetadata } from '@/types/document.types';
import { generateCSVTemplate, downloadCSV, parseCSV, csvRowToMetadata } from '@/lib/utils/csvUtils';
import { toast } from 'sonner';
import { pdfjs } from 'react-pdf';

interface FileWithMetadata {
  id: string;
  file: File;
  pageCount: number | null;
  metadata: {
    documentTypeId: string;
    officeId: string;
    documentNumber: string;
    documentDate: string;
    sender: string;
    folioCount: number;
  };
}

export default function BatchUploadPage() {
  const router = useRouter();
  const { uploadBatch, loading } = useDocuments();
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [archivadorId, setArchivadorId] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ fileName: string; error: string }>;
  } | null>(null);

  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  const archivadorOptions: ComboboxOption[] = archivadores.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));

  const documentTypeOptions: ComboboxOption[] = documentTypes.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const officeOptions: ComboboxOption[] = offices.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const detectPdfPages = async (file: File): Promise<number | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch {
      return null;
    }
  };

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    const existingNames = new Set(files.map(f => f.file.name));
    const uniqueFiles = newFiles.filter(f => !existingNames.has(f.name));

    if (files.length + uniqueFiles.length > 50) {
      toast.error('Maximo 50 archivos permitidos');
      return;
    }

    const processedFiles = await Promise.all(
      uniqueFiles.map(async (file) => {
        const pageCount = await detectPdfPages(file);
        return {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          pageCount,
          metadata: {
            documentTypeId: '',
            officeId: '',
            documentNumber: '',
            documentDate: todayString,
            sender: '',
            folioCount: pageCount || 1,
          },
        };
      })
    );

    setFiles(prev => [...prev, ...processedFiles]);
    
    if (processedFiles.some(f => f.pageCount)) {
      toast.success('Paginas detectadas automaticamente');
    }
  }, [files, todayString]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateMetadata = (id: string, field: string, value: string | number) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, metadata: { ...f.metadata, [field]: value } } : f
    ));
  };

  const copyFromPrevious = (index: number) => {
    if (index === 0) return;
    const prev = files[index - 1];
    setFiles(current => current.map((f, i) => 
      i === index ? {
        ...f,
        metadata: {
          ...f.metadata,
          documentTypeId: prev.metadata.documentTypeId,
          officeId: prev.metadata.officeId,
          sender: prev.metadata.sender,
        }
      } : f
    ));
    toast.success('Datos copiados');
  };

  const handleDownloadTemplate = () => {
    if (files.length === 0) {
      toast.error('Selecciona archivos primero');
      return;
    }
    const csvContent = generateCSVTemplate(files.map(f => f.file.name));
    downloadCSV(csvContent, `plantilla-${todayString}.csv`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const rows = parseCSV(evt.target?.result as string);
        setFiles(prev => prev.map(f => {
          const row = rows.find(r => r.fileName === f.file.name);
          if (row) {
            const meta = csvRowToMetadata(row);
            return { ...f, metadata: { ...f.metadata, ...meta } };
          }
          return f;
        }));
        toast.success(`${rows.length} registros importados`);
      } catch {
        toast.error('Error al importar CSV');
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const validateFiles = (): boolean => {
    if (!archivadorId) {
      toast.error('Selecciona un archivador');
      return false;
    }

    const invalid = files.filter(f => 
      !f.metadata.documentTypeId || 
      !f.metadata.officeId || 
      !f.metadata.documentNumber || 
      !f.metadata.sender
    );

    if (invalid.length > 0) {
      toast.error(`${invalid.length} archivo(s) con datos incompletos`);
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateFiles()) return;

    try {
      const result = await uploadBatch(
        files.map(f => f.file),
        { archivadorId },
        files.map(f => f.metadata as Partial<DocumentMetadata>)
      );

      const data = (result as { data: { successful: number; failed: number; errors: Array<{ fileName: string; error: string }> } }).data;
      setUploadResult({
        successful: data.successful,
        failed: data.failed,
        errors: data.errors || [],
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Pantalla de resultado
  if (uploadResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/archivo/documentos')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Resultado de Carga</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Exitosos</p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{uploadResult.successful}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Fallidos</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">{uploadResult.failed}</p>
                </div>
              </div>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Errores</h3>
              {uploadResult.errors.map((err, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                  <span className="font-medium">{err.fileName}:</span> {err.error}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              variant="outline" 
              onClick={() => { setUploadResult(null); setFiles([]); }}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Nueva carga
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/archivo/documentos')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ir a documentos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard/archivo/documentos')}
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Carga Masiva</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sube multiples documentos a la vez</p>
        </div>
      </div>

      {/* Archivador */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">Archivador destino *</Label>
        <div className="mt-2 max-w-md">
          <Combobox
            options={archivadorOptions}
            value={archivadorId}
            onValueChange={setArchivadorId}
            placeholder="Seleccionar archivador..."
            searchPlaceholder="Buscar..."
          />
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium text-slate-900 dark:text-slate-100">Archivos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{files.length} archivo(s) seleccionado(s)</p>
          </div>
          {files.length > 0 && (
            <div className="flex gap-2">
              <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleImportCSV} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Plantilla
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => csvInputRef.current?.click()}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <Upload className="h-4 w-4 mr-1" />
                Importar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])} 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>
          )}
        </div>

        <FileUploader
          files={files.map(f => f.file)}
          onFilesChange={handleFilesChange}
          maxFiles={50}
        />
      </Card>

      {/* Metadata Table */}
      {files.length > 0 && (
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-x-auto">
          <h2 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Metadatos</h2>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400 w-56">Archivo</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Tipo *</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Oficina *</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Numero *</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400 w-32">Fecha</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Remitente *</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400 w-20">Folios</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span 
                          className="block truncate max-w-[160px] text-slate-900 dark:text-slate-100" 
                          title={item.file.name}
                        >
                          {item.file.name}
                        </span>
                        {item.pageCount && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">{item.pageCount} paginas</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Combobox
                      options={documentTypeOptions}
                      value={item.metadata.documentTypeId}
                      onValueChange={(v) => updateMetadata(item.id, 'documentTypeId', v)}
                      placeholder="Tipo..."
                      className="h-9"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Combobox
                      options={officeOptions}
                      value={item.metadata.officeId}
                      onValueChange={(v) => updateMetadata(item.id, 'officeId', v)}
                      placeholder="Oficina..."
                      className="h-9"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.metadata.documentNumber}
                      onChange={(e) => updateMetadata(item.id, 'documentNumber', e.target.value)}
                      placeholder="OFICIO-001-2025"
                      className="h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      type="date"
                      value={item.metadata.documentDate}
                      onChange={(e) => updateMetadata(item.id, 'documentDate', e.target.value)}
                      max={todayString}
                      className="h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.metadata.sender}
                      onChange={(e) => updateMetadata(item.id, 'sender', e.target.value)}
                      placeholder="Remitente"
                      className="h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      type="number"
                      value={item.metadata.folioCount}
                      onChange={(e) => updateMetadata(item.id, 'folioCount', parseInt(e.target.value) || 1)}
                      min={1}
                      className="h-9 w-16 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50" 
                              onClick={() => setPreviewFile(item.file)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver PDF</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {index > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" 
                                onClick={() => copyFromPrevious(index)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar anterior</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50" 
                              onClick={() => removeFile(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={loading || !archivadorId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir {files.length} archivo(s)
              </>
            )}
          </Button>
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-slate-900 dark:text-slate-100 truncate pr-8">
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-100px)]">
            {previewFile && <PDFPreview file={previewFile} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
