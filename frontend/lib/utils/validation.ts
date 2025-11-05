/**
 * Validation utilities for import data
 */

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate import data based on typology type
 */
export function validateImportData(data: any[], type: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!data || data.length === 0) {
    return {
      valid: false,
      errors: [{ row: 0, field: 'general', message: 'El archivo está vacío' }]
    };
  }
  
  data.forEach((row, index) => {
    const rowNumber = index + 1;
    
    switch (type) {
      case 'office':
        validateOffice(row, rowNumber, errors);
        break;
      case 'documentType':
        validateDocumentType(row, rowNumber, errors);
        break;
      case 'period':
        validatePeriod(row, rowNumber, errors);
        break;
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateOffice(row: any, rowNumber: number, errors: ValidationError[]): void {
  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'El nombre es requerido'
    });
  }
  
  if (!row.code || row.code.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'El código es requerido'
    });
  }
  
  if (row.name && row.name.length > 100) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'El nombre no puede exceder 100 caracteres'
    });
  }
  
  if (row.code && row.code.length > 20) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'El código no puede exceder 20 caracteres'
    });
  }
}

function validateDocumentType(row: any, rowNumber: number, errors: ValidationError[]): void {
  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'El nombre es requerido'
    });
  }
  
  if (!row.code || row.code.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'El código es requerido'
    });
  }
  
  if (row.name && row.name.length > 100) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'El nombre no puede exceder 100 caracteres'
    });
  }
  
  if (row.code && row.code.length > 20) {
    errors.push({
      row: rowNumber,
      field: 'code',
      message: 'El código no puede exceder 20 caracteres'
    });
  }
}

function validatePeriod(row: any, rowNumber: number, errors: ValidationError[]): void {
  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'El nombre es requerido'
    });
  }
  
  if (!row.startDate) {
    errors.push({
      row: rowNumber,
      field: 'startDate',
      message: 'La fecha de inicio es requerida'
    });
  } else if (!isValidDate(row.startDate)) {
    errors.push({
      row: rowNumber,
      field: 'startDate',
      message: 'La fecha de inicio no es válida (formato: YYYY-MM-DD)'
    });
  }
  
  if (!row.endDate) {
    errors.push({
      row: rowNumber,
      field: 'endDate',
      message: 'La fecha de fin es requerida'
    });
  } else if (!isValidDate(row.endDate)) {
    errors.push({
      row: rowNumber,
      field: 'endDate',
      message: 'La fecha de fin no es válida (formato: YYYY-MM-DD)'
    });
  }
  
  if (row.startDate && row.endDate && isValidDate(row.startDate) && isValidDate(row.endDate)) {
    const start = new Date(row.startDate);
    const end = new Date(row.endDate);
    
    if (start > end) {
      errors.push({
        row: rowNumber,
        field: 'dates',
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
  }
  
  if (row.isActive !== undefined && row.isActive !== 'true' && row.isActive !== 'false' && typeof row.isActive !== 'boolean') {
    errors.push({
      row: rowNumber,
      field: 'isActive',
      message: 'El campo isActive debe ser true o false'
    });
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate required fields
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es requerido`;
  }
  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido';
  }
  return null;
}

/**
 * Validate string length
 */
export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres`;
  }
  if (value.length > max) {
    return `${fieldName} no puede exceder ${max} caracteres`;
  }
  return null;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(dateString: string): string | null {
  if (!isValidDate(dateString)) {
    return 'Formato de fecha inválido (use YYYY-MM-DD)';
  }
  return null;
}
