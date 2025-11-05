'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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
        
        // Parse file
        const data = file.name.endsWith('.csv') 
          ? await parseCSV(file) 
          : await parseExcel(file);

        // Validate data
        const validation = validateImportData(data, type);
        
        setPreviewData(data.slice(0, 5)); // Preview first 5 rows
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
      if (format === 'csv') {
        await handleExportCSV(currentFilters);
      } else {
        await handleExportExcel(currentFilters);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
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
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Importación / Exportación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exportación */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Exportar Datos</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => handleExport('csv')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={() => handleExport('excel')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Importación */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Importar Datos</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
              
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors bg-white dark:bg-slate-800
                  ${isDragActive 
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-slate-500" />
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {isDragActive ? (
                    'Suelta el archivo aquí'
                  ) : (
                    <>
                      Arrastra un archivo CSV o Excel aquí<br />
                      o haz clic para seleccionar
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Preview e Importación */}
      <Dialog open={importDialogOpen} onOpenChange={handleCloseImportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Vista Previa de Importación - {getTypeLabel()}</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Revisa los datos antes de confirmar la importación
            </DialogDescription>
          </DialogHeader>

          {validationResult && (
            <div className="space-y-4">
              {/* Validation Status */}
              <div className={`p-4 rounded-lg ${
                validationResult.valid 
                  ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="font-medium text-green-900 dark:text-green-300">
                        Archivo válido - {previewData.length} filas detectadas
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-300">
                          Se encontraron {validationResult.errors.length} errores
                        </p>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                          {validationResult.errors.slice(0, 5).map((error: any, index: number) => (
                            <li key={index}>
                              Fila {error.row}: {error.message}
                            </li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li>... y {validationResult.errors.length - 5} errores más</li>
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
                <div className="space-y-2">
                  <Progress value={importProgress} />
                  <p className="text-sm text-center text-gray-600 dark:text-slate-400">
                    Importando datos...
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImportDialog} disabled={isImporting} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={!validationResult?.valid || isImporting}
            >
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
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-medium text-green-900 dark:text-green-300">
                      {importResult.success.length} registros importados correctamente
                    </h4>
                  </div>
                </div>
              )}

              {/* Errors Summary */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h4 className="font-medium text-red-900 dark:text-red-300">
                      {importResult.errors.length} registros con errores
                    </h4>
                  </div>
                  <div className="mt-3 max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-200 dark:border-red-800">
                          <th className="text-left py-2 px-2 text-red-900 dark:text-red-300">Fila</th>
                          <th className="text-left py-2 px-2 text-red-900 dark:text-red-300">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.map((error: any, index: number) => (
                          <tr key={index} className="border-b border-red-100 dark:border-red-900">
                            <td className="py-2 px-2 text-red-700 dark:text-red-400">{error.row || index + 1}</td>
                            <td className="py-2 px-2 text-red-700 dark:text-red-400">{error.error || error.message}</td>
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
