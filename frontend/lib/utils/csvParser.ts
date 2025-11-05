import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parse CSV file to array of objects
 */
export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Parse Excel file to array of objects
 */
export function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * Generate CSV template for typology type
 */
export function generateTemplate(type: string): Blob {
  let headers: string[] = [];
  let example: string[] = [];
  
  switch (type) {
    case 'office':
      headers = ['name', 'code', 'description'];
      example = ['Oficina de Administración', 'OAD', 'Gestión administrativa'];
      break;
    case 'documentType':
      headers = ['name', 'code', 'description'];
      example = ['Memorando', 'MEM', 'Comunicación interna'];
      break;
    case 'period':
      headers = ['name', 'startDate', 'endDate', 'isActive'];
      example = ['2024', '2024-01-01', '2024-12-31', 'true'];
      break;
    default:
      headers = ['name', 'code', 'description'];
      example = ['Ejemplo', 'EJ01', 'Descripción'];
  }
  
  const csvContent = [
    headers.join(','),
    example.join(',')
  ].join('\n');
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: Blob, filename: string): void {
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV Blob
 */
export function convertToCSV(data: any[]): Blob {
  if (!data || data.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8;' });
  }
  
  const csv = Papa.unparse(data);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Convert array of objects to Excel Blob
 */
export function convertToExcel(data: any[], type: string): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
