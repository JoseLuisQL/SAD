import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface SearchFilters {
  documentNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  documentTypeId?: string;
  sender?: string;
  officeId?: string;
  archivadorId?: string;
  periodId?: string;
  expedienteId?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface SortParams {
  field?: string;
  order?: 'asc' | 'desc';
}

// Stop words en español para ignorar en búsquedas
const SPANISH_STOP_WORDS = new Set([
  'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
  'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
  'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy',
  'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo',
  'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero',
  'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella',
  'del', 'los', 'las', 'uno', 'una', 'unos', 'unas', 'al'
]);

/**
 * Normaliza texto eliminando acentos, caracteres especiales y convirtiendo a minúsculas
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae términos de búsqueda inteligentemente
 * Soporta:
 * - Frases exactas: "ministerio de educación"
 * - Operadores: AND, OR, NOT
 * - Términos simples
 */
function parseSearchQuery(query: string): {
  phrases: string[];
  include: string[];
  exclude: string[];
  operators: { term: string; operator: 'AND' | 'OR' }[];
} {
  const phrases: string[] = [];
  const include: string[] = [];
  const exclude: string[] = [];
  const operators: { term: string; operator: 'AND' | 'OR' }[] = [];
  
  // Extraer frases exactas entre comillas
  const phraseRegex = /"([^"]+)"/g;
  let match;
  while ((match = phraseRegex.exec(query)) !== null) {
    phrases.push(normalizeText(match[1]));
  }
  
  // Remover frases del query para procesar el resto
  let remainingQuery = query.replace(phraseRegex, '');
  
  // Extraer términos con operadores
  const words = remainingQuery.split(/\s+/).filter(w => w.length > 0);
  
  let lastOperator: 'AND' | 'OR' = 'AND';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toUpperCase();
    
    if (word === 'AND' || word === 'Y') {
      lastOperator = 'AND';
      continue;
    }
    
    if (word === 'OR' || word === 'O') {
      lastOperator = 'OR';
      continue;
    }
    
    if (word === 'NOT' || word === 'NO' || words[i].startsWith('-')) {
      const nextWord = words[i + 1] || words[i].substring(1);
      if (nextWord) {
        exclude.push(normalizeText(nextWord));
        i++;
      }
      continue;
    }
    
    const normalizedWord = normalizeText(words[i]);
    
    // Ignorar stop words solo si no son parte de una frase
    if (SPANISH_STOP_WORDS.has(normalizedWord) && normalizedWord.length < 3) {
      continue;
    }
    
    if (normalizedWord.length > 0) {
      operators.push({ term: normalizedWord, operator: lastOperator });
      include.push(normalizedWord);
    }
  }
  
  return { phrases, include, exclude, operators };
}

/**
 * Genera variaciones de un término para búsqueda difusa
 * Tolera errores tipográficos comunes
 */
function generateFuzzyVariations(term: string): string[] {
  const variations = [term];
  
  // Intercambio de letras adyacentes (transposición)
  for (let i = 0; i < term.length - 1; i++) {
    const chars = term.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    variations.push(chars.join(''));
  }
  
  // Letras comúnmente confundidas en español
  const confusions: Record<string, string[]> = {
    'b': ['v'],
    'v': ['b'],
    'c': ['s', 'z', 'k', 'q'],
    's': ['c', 'z', 'x'],
    'z': ['s', 'c'],
    'y': ['i', 'll'],
    'i': ['y'],
    'll': ['y'],
    'h': [''], // h muda
    'j': ['g'],
    'g': ['j']
  };
  
  // Aplicar solo para términos de más de 3 caracteres
  if (term.length > 3) {
    for (let i = 0; i < term.length; i++) {
      const char = term[i];
      if (confusions[char]) {
        confusions[char].forEach(replacement => {
          const variation = term.substring(0, i) + replacement + term.substring(i + 1);
          if (variation.length > 2) {
            variations.push(variation);
          }
        });
      }
    }
  }
  
  return [...new Set(variations)]; // Eliminar duplicados
}

/**
 * Genera snippets de contexto donde se encontró el término
 */
function generateSnippets(text: string, searchTerms: string[], _maxLength: number = 200): string[] {
  if (!text) return [];
  
  const normalizedText = text.toLowerCase();
  const snippets: string[] = [];
  
  for (const term of searchTerms) {
    const normalizedTerm = term.toLowerCase();
    let index = normalizedText.indexOf(normalizedTerm);
    
    while (index !== -1 && snippets.length < 3) {
      const start = Math.max(0, index - 80);
      const end = Math.min(text.length, index + normalizedTerm.length + 120);
      
      let snippet = text.substring(start, end);
      
      // Agregar ellipsis si no es el inicio/fin
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      snippets.push(snippet);
      
      // Buscar siguiente ocurrencia
      index = normalizedText.indexOf(normalizedTerm, index + 1);
    }
  }
  
  return snippets;
}

export const searchDocuments = async (
  query: string,
  filters: SearchFilters = {},
  pagination: PaginationParams = {},
  sort: SortParams = {},
  req?: Request,
  source?: 'manual' | 'saved' | 'preset'
) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;
  const sortField = sort.field || 'documentDate';
  const sortOrder = sort.order || 'desc';

  console.log('=== SERVICIO DE BÚSQUEDA ===');
  console.log('Query recibido:', query);
  console.log('Filtros:', filters);
  console.log('Paginación:', { page, limit, skip });

  const where: any = {};

  if (filters.documentNumber) {
    where.documentNumber = { contains: filters.documentNumber };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.documentDate = {};
    if (filters.dateFrom) {
      where.documentDate.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.documentDate.lte = new Date(filters.dateTo);
    }
  }

  if (filters.documentTypeId) {
    where.documentTypeId = filters.documentTypeId;
  }

  if (filters.sender) {
    where.sender = { contains: filters.sender };
  }

  if (filters.officeId) {
    where.officeId = filters.officeId;
  }

  if (filters.archivadorId) {
    where.archivadorId = filters.archivadorId;
  }

  if (filters.periodId) {
    where.archivador = {
      periodId: filters.periodId
    };
  }

  if (filters.expedienteId) {
    where.expedienteId = filters.expedienteId;
  }

  // Búsqueda inteligente avanzada
  if (query && query.trim() !== '') {
    const searchTerm = query.trim();
    
    // Parse query inteligente con soporte para operadores
    const parsed = parseSearchQuery(searchTerm);
    console.log('Búsqueda parseada:', {
      phrases: parsed.phrases,
      include: parsed.include,
      exclude: parsed.exclude,
      operators: parsed.operators
    });
    
    try {
      // Construir búsqueda MySQL FULLTEXT avanzada
      let fulltextQuery = '';
      const searchConditions: string[] = [];
      
      // Frases exactas (máxima prioridad)
      if (parsed.phrases.length > 0) {
        parsed.phrases.forEach(phrase => {
          searchConditions.push(`+"${phrase}"`);
        });
      }
      
      // Términos incluidos con búsqueda difusa
      if (parsed.include.length > 0) {
        const fuzzyTerms: string[] = [];
        
        for (const term of parsed.include) {
          // Término exacto
          fuzzyTerms.push(term);
          
          // Variaciones difusas solo para términos > 4 caracteres
          if (term.length > 4) {
            const variations = generateFuzzyVariations(term);
            fuzzyTerms.push(...variations.slice(0, 3)); // Limitar a 3 variaciones
          }
        }
        
        // Agrupar términos fuzzy con OR
        const fuzzyGroup = fuzzyTerms.map(t => t).join(' ');
        searchConditions.push(fuzzyGroup);
      }
      
      // Términos excluidos
      if (parsed.exclude.length > 0) {
        parsed.exclude.forEach(term => {
          searchConditions.push(`-${term}`);
        });
      }
      
      fulltextQuery = searchConditions.join(' ');
      
      console.log('Query FULLTEXT final:', fulltextQuery);
      
      // Ejecutar búsqueda FULLTEXT con ranking multi-factor
      const fulltextResults = await prisma.$queryRaw<Array<{
        id: string;
        relevance: number;
      }>>`
        SELECT 
          id,
          (
            -- Búsqueda en anotaciones (peso mayor)
            COALESCE(MATCH(annotations) AGAINST(${fulltextQuery} IN BOOLEAN MODE), 0) * 3 +
            
            -- Búsqueda en contenido OCR
            COALESCE(MATCH(ocrContent) AGAINST(${fulltextQuery} IN BOOLEAN MODE), 0) * 1.5 +
            
            -- Boost adicional si el término aparece en annotations
            CASE 
              WHEN annotations LIKE CONCAT('%', ${searchTerm}, '%') THEN 2
              ELSE 0
            END +
            
            -- Boost si es coincidencia exacta en número de documento
            CASE 
              WHEN documentNumber = ${searchTerm} THEN 10
              WHEN documentNumber LIKE CONCAT('%', ${searchTerm}, '%') THEN 5
              ELSE 0
            END +
            
            -- Boost si es coincidencia en remitente
            CASE 
              WHEN sender LIKE CONCAT('%', ${searchTerm}, '%') THEN 3
              ELSE 0
            END
          ) AS relevance
        FROM documents
        WHERE 
          (
            MATCH(annotations) AGAINST(${fulltextQuery} IN BOOLEAN MODE) > 0
            OR MATCH(ocrContent) AGAINST(${fulltextQuery} IN BOOLEAN MODE) > 0
            OR documentNumber LIKE CONCAT('%', ${searchTerm}, '%')
            OR sender LIKE CONCAT('%', ${searchTerm}, '%')
            OR annotations LIKE CONCAT('%', ${searchTerm}, '%')
            OR ocrContent LIKE CONCAT('%', ${searchTerm}, '%')
          )
        HAVING relevance > 0
        ORDER BY relevance DESC
        LIMIT 1000
      `;

      console.log(`Encontrados ${fulltextResults.length} documentos por FULLTEXT`);

      if (fulltextResults.length > 0) {
        const fulltextIds = fulltextResults.map(r => r.id);
        where.id = { in: fulltextIds };
      } else {
        // Si no hay resultados FULLTEXT, usar búsqueda básica más agresiva
        where.OR = [
          { documentNumber: { contains: searchTerm } },
          { sender: { contains: searchTerm } },
          { annotations: { contains: searchTerm } },
          { ocrContent: { contains: searchTerm } }
        ];
      }
    } catch (error) {
      console.error('Error en búsqueda fulltext:', error);
      // Fallback a búsqueda básica con LIKE
      where.OR = [
        { documentNumber: { contains: searchTerm } },
        { sender: { contains: searchTerm } },
        { annotations: { contains: searchTerm } },
        { ocrContent: { contains: searchTerm } }
      ];
    }
  }

  const orderBy: any = {};
  
  if (sortField === 'documentDate') {
    orderBy.documentDate = sortOrder;
  } else if (sortField === 'documentNumber') {
    orderBy.documentNumber = sortOrder;
  } else if (sortField === 'sender') {
    orderBy.sender = sortOrder;
  } else if (sortField === 'createdAt') {
    orderBy.createdAt = sortOrder;
  } else {
    orderBy.documentDate = 'desc';
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        archivador: {
          include: {
            period: true
          }
        },
        documentType: true,
        office: true,
        expediente: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.document.count({ where })
  ]);

  // Agregar snippets de contexto a los resultados si hay query
  let enrichedDocuments = documents;
  if (query && query.trim() !== '') {
    const searchTerms = parseSearchQuery(query.trim());
    const allTerms = [...searchTerms.phrases, ...searchTerms.include];
    
    enrichedDocuments = documents.map(doc => {
      const ocrSnippets = doc.ocrContent 
        ? generateSnippets(doc.ocrContent, allTerms, 250) 
        : [];
      const annotationSnippets = doc.annotations 
        ? generateSnippets(doc.annotations, allTerms, 200) 
        : [];
      
      return {
        ...doc,
        searchMetadata: {
          ocrSnippets: ocrSnippets.slice(0, 2), // Máximo 2 snippets de OCR
          annotationSnippets: annotationSnippets.slice(0, 1), // Máximo 1 snippet de anotaciones
          matchedTerms: allTerms,
          hasOcrMatch: ocrSnippets.length > 0,
          hasAnnotationMatch: annotationSnippets.length > 0
        }
      };
    });
  }

  if (req && req.user) {
    await log({
      userId: req.user.id,
      action: 'SEARCH_PERFORMED',
      module: 'search',
      entityType: 'Search',
      entityId: 'N/A',
      newValue: {
        query,
        filters,
        resultsCount: total,
        source: source || 'manual'
      },
      req
    });
  }

  return {
    documents: enrichedDocuments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    searchInfo: query ? {
      query: query.trim(),
      parsed: parseSearchQuery(query.trim()),
      hasIntelligentSearch: true
    } : undefined
  };
};

export const getSearchSuggestions = async (query: string) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();
  const normalizedTerm = normalizeText(searchTerm);

  try {
    // Búsqueda inteligente en múltiples campos
    const [documentSuggestions, senderSuggestions, typeSuggestions] = await Promise.all([
      // Sugerencias de números de documento
      prisma.document.findMany({
        where: {
          documentNumber: { contains: searchTerm }
        },
        take: 5,
        select: {
          id: true,
          documentNumber: true,
          sender: true,
          documentDate: true,
          documentType: {
            select: {
              id: true,
              name: true
            }
          }
        },
        distinct: ['documentNumber'],
        orderBy: {
          documentDate: 'desc'
        }
      }),
      
      // Sugerencias de remitentes
      prisma.document.findMany({
        where: {
          sender: { contains: searchTerm }
        },
        take: 5,
        select: {
          sender: true
        },
        distinct: ['sender'],
        orderBy: {
          documentDate: 'desc'
        }
      }),
      
      // Sugerencias de tipos de documento
      prisma.documentType.findMany({
        where: {
          name: { contains: searchTerm }
        },
        take: 3,
        select: {
          name: true
        }
      })
    ]);

    const formattedSuggestions: Array<{
      value: string;
      label: string;
      type: 'document' | 'sender' | 'documentType' | 'term';
      metadata?: any;
    }> = [];

    // Agregar números de documento
    documentSuggestions.forEach(doc => {
      formattedSuggestions.push({
        value: doc.documentNumber,
        label: `${doc.documentNumber} - ${doc.documentType.name}`,
        type: 'document',
        metadata: {
          documentId: doc.id,
          documentType: doc.documentType.name,
          typeId: doc.documentType.id,
          sender: doc.sender,
          documentDate: doc.documentDate.toISOString()
        }
      });
    });

    // Agregar remitentes únicos
    const uniqueSenders = new Set<string>();
    senderSuggestions.forEach(doc => {
      if (!uniqueSenders.has(doc.sender)) {
        uniqueSenders.add(doc.sender);
        formattedSuggestions.push({
          value: doc.sender,
          label: doc.sender,
          type: 'sender'
        });
      }
    });

    // Agregar tipos de documento
    typeSuggestions.forEach(type => {
      formattedSuggestions.push({
        value: type.name,
        label: `Buscar en: ${type.name}`,
        type: 'documentType',
        metadata: { typeName: type.name }
      });
    });

    // Si hay pocas sugerencias, agregar términos comunes relacionados
    if (formattedSuggestions.length < 5) {
      const commonTerms = [
        'contrato', 'informe', 'oficio', 'memorando', 'resolución',
        'acta', 'certificado', 'constancia', 'solicitud', 'carta'
      ];

      commonTerms
        .filter(term => term.toLowerCase().includes(normalizedTerm))
        .slice(0, 3)
        .forEach(term => {
          formattedSuggestions.push({
            value: term,
            label: term.charAt(0).toUpperCase() + term.slice(1),
            type: 'term'
          });
        });
    }

    return formattedSuggestions.slice(0, 10);
  } catch (error) {
    console.error('Error en sugerencias:', error);
    return [];
  }
};

export default {
  searchDocuments,
  getSearchSuggestions
};
