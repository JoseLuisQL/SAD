import { useCallback } from 'react';
import { officesApi } from '@/lib/api/offices';
import { documentTypesApi } from '@/lib/api/document-types';
import { periodsApi } from '@/lib/api/periods';
import { parseCSV, parseExcel, generateTemplate, downloadFile, convertToCSV, convertToExcel } from '@/lib/utils/csvParser';
import { validateImportData } from '@/lib/utils/validation';
import { toast } from 'sonner';

type TypologyType = 'office' | 'documentType' | 'period';

interface ImportResult {
  success: any[];
  errors: any[];
}

export function useImportExport(type: TypologyType) {
  const getApi = () => {
    switch (type) {
      case 'office':
        return officesApi;
      case 'documentType':
        return documentTypesApi;
      case 'period':
        return periodsApi;
    }
  };

  const handleExportCSV = useCallback(async (filters: any = {}) => {
    try {
      const api = getApi();
      const response = await api.exportCSV(filters);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${type}_export_${timestamp}.csv`;
      
      downloadFile(blob, filename);
      toast.success('Exportación CSV completada');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar CSV');
      throw error;
    }
  }, [type]);

  const handleExportExcel = useCallback(async (filters: any = {}) => {
    try {
      const api = getApi();
      const response = await api.exportExcel(filters);
      
      // Convert to Excel and download
      const excelBlob = convertToExcel(response.data.data, type);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${type}_export_${timestamp}.xlsx`;
      
      downloadFile(excelBlob, filename);
      toast.success('Exportación Excel completada');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar Excel');
      throw error;
    }
  }, [type]);

  const downloadTemplateFile = useCallback(() => {
    try {
      const templateContent = generateTemplate(type);
      const filename = `${type}_template.csv`;
      
      downloadFile(templateContent, filename);
      toast.success('Plantilla descargada');
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      toast.error('Error al descargar plantilla');
    }
  }, [type]);

  const handleImportCSV = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      // Parse CSV
      const data = await parseCSV(file);

      // Validate data
      const validation = validateImportData(data, type);
      
      if (!validation.valid) {
        toast.error(`Se encontraron ${validation.errors.length} errores en el archivo`);
        return {
          success: [],
          errors: validation.errors,
        };
      }

      // Import data
      const api = getApi();
      const response = await api.importCSV(data);
      
      const result = response.data.data;
      
      if (result.success.length > 0) {
        toast.success(`${result.success.length} registros importados correctamente`);
      }
      
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} registros con errores`);
      }

      return result;
    } catch (error) {
      console.error('Error al importar CSV:', error);
      toast.error('Error al importar CSV');
      throw error;
    }
  }, [type]);

  const handleImportExcel = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      // Parse Excel
      const data = await parseExcel(file);

      // Validate data
      const validation = validateImportData(data, type);
      
      if (!validation.valid) {
        toast.error(`Se encontraron ${validation.errors.length} errores en el archivo`);
        return {
          success: [],
          errors: validation.errors,
        };
      }

      // Import data
      const api = getApi();
      const response = await api.importExcel(data);
      
      const result = response.data.data;
      
      if (result.success.length > 0) {
        toast.success(`${result.success.length} registros importados correctamente`);
      }
      
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} registros con errores`);
      }

      return result;
    } catch (error) {
      console.error('Error al importar Excel:', error);
      toast.error('Error al importar Excel');
      throw error;
    }
  }, [type]);

  return {
    handleExportCSV,
    handleExportExcel,
    handleImportCSV,
    handleImportExcel,
    downloadTemplate: downloadTemplateFile,
  };
}
