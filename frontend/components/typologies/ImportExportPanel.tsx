'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useImportExport } from '@/hooks/useImportExport';
import { parseCSV, parseExcel } from '@/lib/utils/csvParser';
import { validateImportData } from '@/lib/utils/validation';
import { ImportPreviewTable } from './ImportPreviewTable';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

type TypologyType = 'office' | 'documentType' | 'period';

interface ImportExportPanelProps {
  type: TypologyType;
  currentFilters?: any;
  onImportComplete?: () => void;
}

export function ImportExportPanel({ type, currentFilters, onImportComplete }: ImportExportPanelProps) {
  const { handleExportCSV, handleExportExcel, handleImportCSV, handleImportExcel, downloadTemplate } = useImportExport(type);
  
  const [isOpen, setIsOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'excel' | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: any[]; errors: any[] } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setCurrentFile(file);
        
        const data = file.name.endsWith('.csv') 
          ? await parseCSV(file) 
          : await parseExcel(file);

        const validation = validateImportData(data, type);
        
        setPreviewData(data.slice(0, 5));
        setValidationResult(validation);
        setImportDialogOpen(true);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
        toast.error('Error al leer el archivo');
      }
    }
  });

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(format);
      if (format === 'csv') {
        await handleExportCSV(currentFilters);
      } else {
        await handleExportExcel(currentFilters);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!currentFile) return;

    try {
      setIsImporting(true);
      setImportProgress(30);

      const result = currentFile.name.endsWith('.csv')
        ? await handleImportCSV(currentFile)
        : await handleImportExcel(currentFile);

      setImportProgress(100);
      setImportResult(result);
      setImportDialogOpen(false);
      setResultDialogOpen(true);

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error en importación:', error);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setPreviewData([]);
    setValidationResult(null);
    setCurrentFile(null);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'office':
        return 'Oficinas';
      case 'documentType':
        return 'Tipos de Documento';
      case 'period':
        return 'Periodos';
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <CollapsibleTrigger asChild>
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
                  <FileSpreadsheet className="h-4 w-4 text-gray-600 dark:text-slate-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Importación / Exportación
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Importa o exporta datos en formato CSV o Excel
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                aria-hidden="true"
              />
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Exportación */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Exportar Datos
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => handleExport('csv')}
                      disabled={isExporting !== null}
                    >
                      {isExporting === 'csv' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => handleExport('excel')}
                      disabled={isExporting !== null}
                    >
                      {isExporting === 'excel' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      Excel
                    </Button>
                  </div>
                </div>

                {/* Importación */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Importar Datos
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={downloadTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Descargar Plantilla
                    </Button>
                    
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        ${isDragActive 
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' 
                          : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }
                      `}
                      role="button"
                      tabIndex={0}
                      aria-label="Área para arrastrar archivos o hacer clic para seleccionar"
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        {isDragActive ? (
                          'Suelta el archivo aquí'
                        ) : (
                          <>
                            Arrastra un archivo aquí o{' '}
                            <span className="text-blue-600 dark:text-blue-400 font-medium">haz clic</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        CSV, XLS, XLSX
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Dialog de Preview e Importación */}
      <Dialog open={importDialogOpen} onOpenChange={handleCloseImportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Vista Previa de Importación - {getTypeLabel()}
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Revisa los datos antes de confirmar la importación
            </DialogDescription>
          </DialogHeader>

          {validationResult && (
            <div className="space-y-4">
              {/* Validation Status */}
              <div 
                className={`p-4 rounded-lg ${
                  validationResult.valid 
                    ? 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                }`}
                role="alert"
              >
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-300">
                          Archivo válido
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                          {previewData.length} filas listas para importar
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-300">
                          Se encontraron {validationResult.errors.length} errores
                        </p>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-0.5">
                          {validationResult.errors.slice(0, 5).map((error: any, index: number) => (
                            <li key={index}>
                              Fila {error.row}: {error.message}
                            </li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li className="font-medium">
                              ... y {validationResult.errors.length - 5} errores más
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              {previewData.length > 0 && (
                <ImportPreviewTable
                  data={previewData}
                  validation={validationResult}
                  type={type}
                />
              )}

              {/* Progress Bar */}
              {isImporting && (
                <div className="space-y-2" role="status" aria-live="polite">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-center text-gray-600 dark:text-slate-400">
                    Importando datos...
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseImportDialog} 
              disabled={isImporting} 
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={!validationResult?.valid || isImporting}
              className="min-w-[160px]"
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isImporting ? 'Importando...' : 'Confirmar Importación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Resultados */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Resultado de Importación</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Resumen de la importación completada
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              {/* Success Summary */}
              {importResult.success.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <p className="font-medium text-green-900 dark:text-green-300">
                      {importResult.success.length} registros importados correctamente
                    </p>
                  </div>
                </div>
              )}

              {/* Errors Summary */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <p className="font-medium text-red-900 dark:text-red-300">
                      {importResult.errors.length} registros con errores
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded border border-red-200 dark:border-red-800">
                    <table className="w-full text-sm">
                      <thead className="bg-red-100 dark:bg-red-900/50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3 text-red-900 dark:text-red-300 font-medium">Fila</th>
                          <th className="text-left py-2 px-3 text-red-900 dark:text-red-300 font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 dark:divide-red-900">
                        {importResult.errors.map((error: any, index: number) => (
                          <tr key={index} className="bg-white dark:bg-red-950/30">
                            <td className="py-2 px-3 text-red-700 dark:text-red-400 font-mono">
                              {error.row || index + 1}
                            </td>
                            <td className="py-2 px-3 text-red-700 dark:text-red-400">
                              {error.error || error.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
