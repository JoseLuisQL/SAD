import { DocumentMetadata } from '@/types/document.types';

interface CSVRow {
  fileName: string;
  documentNumber: string;
  documentDate: string;
  sender: string;
  folioCount: string;
  documentTypeId: string;
  officeId: string;
  annotations?: string;
}

export function generateCSVTemplate(fileNames: string[]): string {
  const headers = [
    'fileName',
    'documentNumber',
    'documentDate',
    'sender',
    'folioCount',
    'documentTypeId',
    'officeId',
    'annotations',
  ];

  const rows = fileNames.map((fileName) => [
    fileName,
    '', // documentNumber
    new Date().toISOString().split('T')[0], // documentDate (today)
    '', // sender
    '1', // folioCount
    '', // documentTypeId
    '', // officeId
    '', // annotations
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe contener al menos una fila de encabezados y una fila de datos');
  }

  // Parse headers
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!values) continue;

    const cleanValues = values.map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = cleanValues[index] || '';
    });

    rows.push(row as CSVRow);
  }

  return rows;
}

export function validateCSVRow(row: CSVRow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!row.fileName) {
    errors.push('fileName es requerido');
  }
  if (!row.documentNumber) {
    errors.push('documentNumber es requerido');
  }
  if (!row.documentDate) {
    errors.push('documentDate es requerido');
  }
  if (!row.sender) {
    errors.push('sender es requerido');
  }
  if (!row.folioCount || isNaN(Number(row.folioCount)) || Number(row.folioCount) < 1) {
    errors.push('folioCount debe ser un número mayor a 0');
  }
  if (!row.documentTypeId) {
    errors.push('documentTypeId es requerido');
  }
  if (!row.officeId) {
    errors.push('officeId es requerido');
  }

  return { valid: errors.length === 0, errors };
}

export function csvRowToMetadata(row: CSVRow): Partial<DocumentMetadata> {
  return {
    documentNumber: row.documentNumber,
    documentDate: row.documentDate,
    sender: row.sender,
    folioCount: parseInt(row.folioCount, 10),
    documentTypeId: row.documentTypeId,
    officeId: row.officeId,
    annotations: row.annotations || '',
  };
}
