export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'documento' | 'expediente' | 'archivo' | 'firma' | 'sistema';
  examples?: string[];
}

export const glossary: Record<string, GlossaryTerm> = {
  folio: {
    term: 'Folio',
    definition: 'Número único secuencial asignado a cada documento dentro de un expediente, que permite su identificación y orden cronológico.',
    category: 'documento',
    examples: ['Folio 001', 'Folio 245']
  },
  expediente: {
    term: 'Expediente',
    definition: 'Conjunto organizado de documentos relacionados con un mismo asunto o trámite administrativo, que se gestionan como una unidad.',
    category: 'expediente',
    examples: ['Expediente de contratación', 'Expediente de personal']
  },
  archivador: {
    term: 'Archivador',
    definition: 'Unidad de organización física o digital que agrupa expedientes relacionados por área, período o criterio administrativo.',
    category: 'archivo',
    examples: ['Archivador 2024-001', 'Archivador Recursos Humanos']
  },
  ocr: {
    term: 'OCR (Reconocimiento Óptico de Caracteres)',
    definition: 'Tecnología que convierte imágenes de texto en documentos escaneados a texto digital editable y búsquedable.',
    category: 'sistema',
    examples: ['Procesamiento OCR en español', 'Extracción de texto de PDF']
  },
  version: {
    term: 'Versión',
    definition: 'Registro de cada modificación realizada a un documento, permitiendo trazabilidad y recuperación de versiones anteriores.',
    category: 'documento',
    examples: ['Versión 1.0', 'Versión 2.3']
  },
  firma_digital: {
    term: 'Firma Digital',
    definition: 'Firma electrónica con validez legal que garantiza la autenticidad, integridad y no repudio de documentos digitales mediante certificados digitales.',
    category: 'firma',
    examples: ['Firma con certificado RENIEC', 'Firma electrónica Perú']
  },
  tipologia: {
    term: 'Tipología Documental',
    definition: 'Clasificación de documentos según su naturaleza, contenido y función administrativa (memorándum, resolución, oficio, etc.).',
    category: 'documento',
    examples: ['Memorándum', 'Resolución Directoral', 'Oficio']
  },
  flujo_firma: {
    term: 'Flujo de Firma',
    definition: 'Secuencia ordenada de firmantes que deben aprobar y firmar digitalmente un documento antes de su validación final.',
    category: 'firma',
    examples: ['Flujo: Solicitante → Jefe → Director', 'Firma secuencial']
  },
  auditoria: {
    term: 'Auditoría',
    definition: 'Registro detallado de todas las acciones realizadas en el sistema, incluyendo usuario, fecha, hora y tipo de operación.',
    category: 'sistema',
    examples: ['Log de acceso a documentos', 'Registro de modificaciones']
  },
  metadatos: {
    term: 'Metadatos',
    definition: 'Información descriptiva asociada a un documento que facilita su búsqueda, clasificación y gestión (título, fecha, autor, tipo, etc.).',
    category: 'documento',
    examples: ['Fecha de creación', 'Autor del documento', 'Oficina emisora']
  },
  trazabilidad: {
    term: 'Trazabilidad',
    definition: 'Capacidad de rastrear el historial completo de un documento o expediente, desde su creación hasta su archivo o eliminación.',
    category: 'sistema',
    examples: ['Historial de cambios', 'Cadena de custodia digital']
  },
  contraste: {
    term: 'Contraste',
    definition: 'Proceso de comparación y verificación de documentos físicos contra sus versiones digitales para garantizar conformidad.',
    category: 'documento',
    examples: ['Contraste de documentos escaneados', 'Verificación de integridad']
  }
};

export function getGlossaryTerm(key: string): GlossaryTerm | undefined {
  return glossary[key.toLowerCase()];
}

export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(glossary).filter(
    term =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery)
  );
}

export function getGlossaryByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return Object.values(glossary).filter(term => term.category === category);
}
