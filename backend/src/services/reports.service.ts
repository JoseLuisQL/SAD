import prisma from '../config/database';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import * as auditService from './audit.service';
import * as configurationService from './configuration.service';
import * as fs from 'fs';
import * as path from 'path';
import cache, { generateCacheKey } from '../utils/cache.util';

interface DocumentReportFilters {
  periodId?: string;
  officeId?: string;
  documentTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface UserActivityReportFilters {
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SignatureReportFilters {
  signerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Cache TTL: 5 minutes (300000 ms)
const CACHE_TTL = 5 * 60 * 1000;

export const generateDocumentReport = async (filters: DocumentReportFilters) => {
  // Check cache first
  const cacheKey = generateCacheKey('report:documents', filters);
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[Reports] Serving document report from cache');
    return cached;
  }

  const where: any = {};

  if (filters.periodId) {
    where.archivador = {
      periodId: filters.periodId
    };
  }

  if (filters.officeId) {
    where.officeId = filters.officeId;
  }

  if (filters.documentTypeId) {
    where.documentTypeId = filters.documentTypeId;
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

  const [
    totalDocuments,
    totalFolios,
    signedDocuments,
    ocrDocuments,
    documentsByType,
    documentsByOffice,
    documentsByMonth
  ] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.aggregate({
      where,
      _sum: {
        folioCount: true
      }
    }),
    prisma.document.count({
      where: {
        ...where,
        signatureStatus: 'SIGNED'
      }
    }),
    prisma.document.count({
      where: {
        ...where,
        ocrStatus: 'COMPLETED'
      }
    }),
    prisma.document.groupBy({
      by: ['documentTypeId'],
      where,
      _count: {
        id: true
      },
      _sum: {
        folioCount: true
      }
    }),
    prisma.document.groupBy({
      by: ['officeId'],
      where,
      _count: {
        id: true
      },
      _sum: {
        folioCount: true
      }
    }),
    (async () => {
      let query = `
        SELECT 
          DATE_FORMAT(documentDate, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(folioCount) as totalFolios
        FROM documents
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (filters.periodId) {
        query += ` AND archivadorId IN (SELECT id FROM archivadores WHERE periodId = ?)`;
        params.push(filters.periodId);
      }
      
      if (filters.officeId) {
        query += ` AND officeId = ?`;
        params.push(filters.officeId);
      }
      
      if (filters.documentTypeId) {
        query += ` AND documentTypeId = ?`;
        params.push(filters.documentTypeId);
      }
      
      if (filters.dateFrom) {
        query += ` AND documentDate >= ?`;
        params.push(new Date(filters.dateFrom));
      }
      
      if (filters.dateTo) {
        query += ` AND documentDate <= ?`;
        params.push(new Date(filters.dateTo));
      }
      
      query += `
        GROUP BY DATE_FORMAT(documentDate, '%Y-%m')
        ORDER BY month ASC
      `;
      
      return prisma.$queryRawUnsafe<any[]>(query, ...params);
    })()
  ]);

  const documentTypeIds = documentsByType.map(item => item.documentTypeId);
  const officeIds = documentsByOffice.map(item => item.officeId);

  const [documentTypes, offices] = await Promise.all([
    prisma.documentType.findMany({
      where: {
        id: {
          in: documentTypeIds
        }
      },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.office.findMany({
      where: {
        id: {
          in: officeIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })
  ]);

  const documentsByTypeWithInfo = documentsByType.map(item => {
    const type = documentTypes.find(t => t.id === item.documentTypeId);
    return {
      documentTypeId: item.documentTypeId,
      documentTypeName: type?.name || 'Unknown',
      count: item._count.id,
      totalFolios: item._sum.folioCount || 0
    };
  });

  const documentsByOfficeWithInfo = documentsByOffice.map(item => {
    const office = offices.find(o => o.id === item.officeId);
    return {
      officeId: item.officeId,
      officeName: office?.name || 'Unknown',
      count: item._count.id,
      totalFolios: item._sum.folioCount || 0
    };
  });

  const result = {
    summary: {
      totalDocuments,
      totalFolios: totalFolios._sum.folioCount || 0,
      signedDocuments,
      ocrDocuments,
      unsignedDocuments: totalDocuments - signedDocuments,
      pendingOcr: totalDocuments - ocrDocuments
    },
    documentsByType: documentsByTypeWithInfo,
    documentsByOffice: documentsByOfficeWithInfo,
    documentsByMonth: documentsByMonth.map(item => ({
      month: item.month,
      count: Number(item.count),
      totalFolios: Number(item.totalFolios)
    }))
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL);
  console.log('[Reports] Document report cached');

  return result;
};

export const generateUserActivityReport = async (filters: UserActivityReportFilters) => {
  // Check cache first
  const cacheKey = generateCacheKey('report:activity', filters);
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[Reports] Serving activity report from cache');
    return cached;
  }

  const auditFilters: any = {
    page: 1,
    limit: 10000
  };

  if (filters.userId) {
    auditFilters.userId = filters.userId;
  }

  if (filters.action) {
    auditFilters.action = filters.action;
  }

  if (filters.dateFrom) {
    auditFilters.dateFrom = new Date(filters.dateFrom);
  }

  if (filters.dateTo) {
    auditFilters.dateTo = new Date(filters.dateTo);
  }

  const { logs } = await auditService.getAuditLogs(auditFilters);

  const actionsByUser: Record<string, any> = {};
  const actionsByModule: Record<string, number> = {};
  const actionsByAction: Record<string, number> = {};
  const actionsByDay: Record<string, number> = {};

  logs.forEach(log => {
    const userId = log.userId;
    const userName = `${log.user.firstName} ${log.user.lastName}`;
    const module = log.module;
    const action = log.action;
    const day = log.createdAt.toISOString().split('T')[0];

    if (!actionsByUser[userId]) {
      actionsByUser[userId] = {
        userId,
        username: log.user.username,
        fullName: userName,
        actions: {}
      };
    }

    if (!actionsByUser[userId].actions[action]) {
      actionsByUser[userId].actions[action] = 0;
    }
    actionsByUser[userId].actions[action]++;

    if (!actionsByModule[module]) {
      actionsByModule[module] = 0;
    }
    actionsByModule[module]++;

    if (!actionsByAction[action]) {
      actionsByAction[action] = 0;
    }
    actionsByAction[action]++;

    if (!actionsByDay[day]) {
      actionsByDay[day] = 0;
    }
    actionsByDay[day]++;
  });

  const totalActions = logs.length;

  const activityByUser = Object.values(actionsByUser).map(user => ({
    ...user,
    totalActions: Object.values(user.actions).reduce((sum: number, count: any) => sum + count, 0)
  })).sort((a, b) => b.totalActions - a.totalActions);

  const activityByModule = Object.entries(actionsByModule).map(([module, count]) => ({
    module,
    count
  })).sort((a, b) => b.count - a.count);

  const activityByAction = Object.entries(actionsByAction).map(([action, count]) => ({
    action,
    count
  })).sort((a, b) => b.count - a.count);

  const activityByDay = Object.entries(actionsByDay).map(([day, count]) => ({
    day,
    count
  })).sort((a, b) => a.day.localeCompare(b.day));

  const result = {
    summary: {
      totalActions,
      uniqueUsers: Object.keys(actionsByUser).length,
      uniqueModules: Object.keys(actionsByModule).length,
      uniqueActions: Object.keys(actionsByAction).length
    },
    activityByUser,
    activityByModule,
    activityByAction,
    activityByDay
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL);
  console.log('[Reports] Activity report cached');

  return result;
};

export const generateSignatureReport = async (filters: SignatureReportFilters) => {
  // Check cache first
  const cacheKey = generateCacheKey('report:signatures', filters);
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[Reports] Serving signature report from cache');
    return cached;
  }
  const where: any = {};

  if (filters.signerId) {
    where.signerId = filters.signerId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.timestamp = {};
    if (filters.dateFrom) {
      where.timestamp.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.timestamp.lte = new Date(filters.dateTo);
    }
  }

  const [
    totalSignatures,
    validSignatures,
    revertedSignatures,
    signaturesBySigner,
    signaturesByStatus,
    signaturesByDay,
    activeFlows,
    completedFlows
  ] = await Promise.all([
    prisma.signature.count({ where }),
    prisma.signature.count({
      where: {
        ...where,
        isValid: true,
        isReverted: false
      }
    }),
    prisma.signature.count({
      where: {
        ...where,
        isReverted: true
      }
    }),
    prisma.signature.groupBy({
      by: ['signerId'],
      where,
      _count: {
        id: true
      }
    }),
    prisma.signature.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true
      }
    }),
    (async () => {
      let query = `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM signatures
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (filters.signerId) {
        query += ` AND signerId = ?`;
        params.push(filters.signerId);
      }
      
      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }
      
      if (filters.dateFrom) {
        query += ` AND timestamp >= ?`;
        params.push(new Date(filters.dateFrom));
      }
      
      if (filters.dateTo) {
        query += ` AND timestamp <= ?`;
        params.push(new Date(filters.dateTo));
      }
      
      query += `
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;
      
      return prisma.$queryRawUnsafe<any[]>(query, ...params);
    })(),
    prisma.signatureFlow.count({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    }),
    prisma.signatureFlow.count({
      where: {
        status: 'COMPLETED'
      }
    })
  ]);

  const signerIds = signaturesBySigner.map(item => item.signerId);

  const signers = await prisma.user.findMany({
    where: {
      id: {
        in: signerIds
      }
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true
    }
  });

  const signaturesBySignerWithInfo = signaturesBySigner.map(item => {
    const signer = signers.find(s => s.id === item.signerId);
    return {
      signerId: item.signerId,
      signerName: signer ? `${signer.firstName} ${signer.lastName}` : 'Unknown',
      username: signer?.username || 'unknown',
      count: item._count.id
    };
  }).sort((a, b) => b.count - a.count);

  const signaturesByStatusWithInfo = signaturesByStatus.map(item => ({
    status: item.status,
    count: item._count.id
  })).sort((a, b) => b.count - a.count);

  const result = {
    summary: {
      totalSignatures,
      validSignatures,
      revertedSignatures,
      invalidSignatures: totalSignatures - validSignatures - revertedSignatures,
      activeFlows,
      completedFlows
    },
    signaturesBySigner: signaturesBySignerWithInfo,
    signaturesByStatus: signaturesByStatusWithInfo,
    signaturesByDay: signaturesByDay.map(item => ({
      date: item.date,
      count: Number(item.count)
    }))
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL);
  console.log('[Reports] Signature report cached');

  return result;
};

export const exportReport = async (
  reportData: any,
  format: 'pdf' | 'xlsx' | 'csv',
  reportName: string,
  userId: string
): Promise<Buffer> => {
  try {
    let buffer: Buffer;

    switch (format) {
      case 'pdf':
        buffer = await exportToPDF(reportData, reportName);
        break;
      case 'xlsx':
        buffer = await exportToExcel(reportData, reportName);
        break;
      case 'csv':
        buffer = exportToCSV(reportData, reportName);
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }

    await auditService.log({
      userId,
      action: 'REPORT_EXPORTED' as any,
      module: 'REPORTS',
      entityType: 'REPORT',
      entityId: reportName,
      newValue: { format, reportName }
    });

    return buffer;
  } catch (error) {
    throw new Error(`Error al exportar reporte: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Colores corporativos
const COLORS = {
  primary: rgb(0.18, 0.31, 0.56), // Azul corporativo #2E4F8F
  secondary: rgb(0.13, 0.55, 0.13), // Verde #228B22
  accent: rgb(0.95, 0.61, 0.07), // Naranja #F29D12
  text: rgb(0.2, 0.2, 0.2), // Gris oscuro
  textLight: rgb(0.5, 0.5, 0.5), // Gris claro
  background: rgb(0.98, 0.98, 0.98), // Gris muy claro
  white: rgb(1, 1, 1),
  border: rgb(0.85, 0.85, 0.85), // Gris borde
};

interface PDFHelpers {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  yPosition: number;
  pageWidth: number;
  pageHeight: number;
  margin: number;
}

const addHeader = async (helpers: PDFHelpers, reportName: string) => {
  const { page, boldFont, font, pageWidth, margin } = helpers;
  
  // Get system configuration
  const config = await configurationService.getSystemConfig();
  
  // Cargar logo
  try {
    let logoPath: string | null = null;
    
    // Try to use configured logo
    if (config.logoUrl) {
      // Extract filename from logoUrl and construct path
      const urlParts = config.logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const configLogoPath = path.join(process.cwd(), 'uploads', 'system-config', fileName);
      if (fs.existsSync(configLogoPath)) {
        logoPath = configLogoPath;
      }
    }
    
    // Fallback to default logo
    if (!logoPath) {
      const defaultLogoPath = path.join(__dirname, '../../assets/logo.png');
      if (fs.existsSync(defaultLogoPath)) {
        logoPath = defaultLogoPath;
      }
    }

    if (logoPath) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await helpers.doc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.15);
      
      page.drawImage(logoImage, {
        x: margin,
        y: helpers.pageHeight - margin - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
    }
  } catch (error) {
    console.error('Error cargando logo:', error);
  }

  // Información de la empresa (lado derecho)
  const companyInfoX = pageWidth - margin - 200;
  let yPos = helpers.pageHeight - margin;

  page.drawText(config.companyName || 'DISA CHINCHEROS', {
    x: companyInfoX,
    y: yPos,
    size: 11,
    font: boldFont,
    color: COLORS.primary,
  });

  yPos -= 15;
  page.drawText(config.companyTagline || 'Sistema de Archivo Digital', {
    x: companyInfoX,
    y: yPos,
    size: 8,
    font,
    color: COLORS.textLight,
  });

  if (config.companyEmail) {
    yPos -= 12;
    page.drawText(`Email: ${config.companyEmail}`, {
      x: companyInfoX,
      y: yPos,
      size: 7,
      font,
      color: COLORS.textLight,
    });
  }

  yPos -= 12;
  page.drawText(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, {
    x: companyInfoX,
    y: yPos,
    size: 8,
    font,
    color: COLORS.textLight,
  });

  // Línea decorativa
  page.drawLine({
    start: { x: margin, y: helpers.pageHeight - margin - 60 },
    end: { x: pageWidth - margin, y: helpers.pageHeight - margin - 60 },
    thickness: 2,
    color: COLORS.primary,
  });

  // Título del reporte
  yPos = helpers.pageHeight - margin - 80;
  page.drawText(reportName, {
    x: margin,
    y: yPos,
    size: 20,
    font: boldFont,
    color: COLORS.primary,
  });

  helpers.yPosition = yPos - 35;
};

const addFooter = async (helpers: PDFHelpers, pageNumber: number, totalPages: number) => {
  const { page, font, pageWidth, margin } = helpers;
  const footerY = margin - 15;

  // Get system configuration
  const config = await configurationService.getSystemConfig();

  // Línea superior del footer
  page.drawLine({
    start: { x: margin, y: margin + 5 },
    end: { x: pageWidth - margin, y: margin + 5 },
    thickness: 1,
    color: COLORS.border,
  });

  // Texto del footer
  const companyName = config.companyName || 'DISA CHINCHEROS';
  const footerText = `${companyName} - Página ${pageNumber} de ${totalPages}`;
  const textWidth = font.widthOfTextAtSize(footerText, 8);
  
  page.drawText(footerText, {
    x: (pageWidth - textWidth) / 2,
    y: footerY,
    size: 8,
    font,
    color: COLORS.textLight,
  });
};

const drawTable = (
  helpers: PDFHelpers,
  headers: string[],
  rows: string[][],
  columnWidths: number[]
) => {
  const { page, font, boldFont, margin } = helpers;
  let { yPosition } = helpers;

  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const rowHeight = 20;
  const headerHeight = 25;

  // Fondo del header
  page.drawRectangle({
    x: margin,
    y: yPosition - headerHeight,
    width: tableWidth,
    height: headerHeight,
    color: COLORS.primary,
  });

  // Headers
  let xPos = margin + 5;
  headers.forEach((header, i) => {
    page.drawText(header, {
      x: xPos,
      y: yPosition - 17,
      size: 9,
      font: boldFont,
      color: COLORS.white,
    });
    xPos += columnWidths[i];
  });

  yPosition -= headerHeight;

  // Rows
  rows.forEach((row, rowIndex) => {
    // Fondo alternado
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: yPosition - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: COLORS.background,
      });
    }

    // Borde de fila
    page.drawLine({
      start: { x: margin, y: yPosition - rowHeight },
      end: { x: margin + tableWidth, y: yPosition - rowHeight },
      thickness: 0.5,
      color: COLORS.border,
    });

    xPos = margin + 5;
    row.forEach((cell, colIndex) => {
      const cellText = String(cell).substring(0, 30);
      page.drawText(cellText, {
        x: xPos,
        y: yPosition - 15,
        size: 8,
        font,
        color: COLORS.text,
      });
      xPos += columnWidths[colIndex];
    });

    yPosition -= rowHeight;
  });

  // Borde final
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + tableWidth, y: yPosition },
    thickness: 1,
    color: COLORS.primary,
  });

  helpers.yPosition = yPosition - 20;
};

const addSection = (helpers: PDFHelpers, title: string) => {
  const { page, boldFont, margin, pageWidth } = helpers;
  
  // Fondo de sección
  page.drawRectangle({
    x: margin,
    y: helpers.yPosition - 25,
    width: pageWidth - 2 * margin,
    height: 25,
    color: rgb(0.95, 0.96, 0.97),
  });

  page.drawText(title, {
    x: margin + 10,
    y: helpers.yPosition - 17,
    size: 12,
    font: boldFont,
    color: COLORS.primary,
  });

  helpers.yPosition -= 40;
};

const addSummaryBox = (helpers: PDFHelpers, data: Record<string, any>) => {
  const { page, font, boldFont, margin, pageWidth } = helpers;
  const boxWidth = (pageWidth - 2 * margin - 30) / 2;
  const boxHeight = 40;
  let xPos = margin;
  let yPos = helpers.yPosition;

  // Traducciones de las métricas del resumen
  const summaryTranslations: Record<string, string> = {
    'totalDocuments': 'Total de Documentos',
    'totalFolios': 'Total de Folios',
    'signedDocuments': 'Documentos Firmados',
    'ocrDocuments': 'Documentos con OCR',
    'unsignedDocuments': 'Sin Firmar',
    'pendingOcr': 'OCR Pendiente',
    'totalSignatures': 'Total de Firmas',
    'validSignatures': 'Firmas Válidas',
    'revertedSignatures': 'Firmas Revertidas',
    'invalidSignatures': 'Firmas Inválidas',
    'activeFlows': 'Flujos Activos',
    'completedFlows': 'Flujos Completados',
    'totalActions': 'Total de Acciones',
    'uniqueUsers': 'Usuarios Únicos',
    'uniqueModules': 'Módulos Únicos',
    'uniqueActions': 'Acciones Únicas',
  };

  const entries = Object.entries(data);
  const half = Math.ceil(entries.length / 2);

  // Primera columna
  entries.slice(0, half).forEach(([key, value]) => {
    // Fondo del box
    page.drawRectangle({
      x: xPos,
      y: yPos - boxHeight,
      width: boxWidth,
      height: boxHeight,
      color: COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 1,
    });

    // Label traducido
    const label = summaryTranslations[key] || key.replace(/([A-Z])/g, ' $1').trim();
    const fontSize = label.length > 25 ? 7 : 8;
    page.drawText(label, {
      x: xPos + 10,
      y: yPos - 15,
      size: fontSize,
      font,
      color: COLORS.textLight,
    });

    // Value
    page.drawText(String(value), {
      x: xPos + 10,
      y: yPos - 30,
      size: 14,
      font: boldFont,
      color: COLORS.primary,
    });

    yPos -= boxHeight + 10;
  });

  // Segunda columna
  xPos = margin + boxWidth + 15;
  yPos = helpers.yPosition;

  entries.slice(half).forEach(([key, value]) => {
    page.drawRectangle({
      x: xPos,
      y: yPos - boxHeight,
      width: boxWidth,
      height: boxHeight,
      color: COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 1,
    });

    const label = summaryTranslations[key] || key.replace(/([A-Z])/g, ' $1').trim();
    const fontSize = label.length > 25 ? 7 : 8;
    page.drawText(label, {
      x: xPos + 10,
      y: yPos - 15,
      size: fontSize,
      font,
      color: COLORS.textLight,
    });

    page.drawText(String(value), {
      x: xPos + 10,
      y: yPos - 30,
      size: 14,
      font: boldFont,
      color: COLORS.primary,
    });

    yPos -= boxHeight + 10;
  });

  helpers.yPosition = Math.min(helpers.yPosition - (half * (boxHeight + 10)), yPos) - 20;
};

const exportToPDF = async (reportData: any, reportName: string): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 50;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let helpers: PDFHelpers = {
    doc: pdfDoc,
    page: currentPage,
    font,
    boldFont,
    yPosition: pageHeight - margin,
    pageWidth,
    pageHeight,
    margin,
  };

  // Header en primera página
  await addHeader(helpers, reportName);

  // Resumen
  if (reportData.summary) {
    addSection(helpers, 'RESUMEN EJECUTIVO');
    addSummaryBox(helpers, reportData.summary);
  }

  // Mapeo de campos a español
  const fieldTranslations: Record<string, string> = {
    // Campos generales
    'documentTypeId': 'ID Tipo',
    'documentTypeName': 'Tipo de Documento',
    'count': 'Cantidad',
    'officeId': 'ID Oficina',
    'officeName': 'Oficina',
    'month': 'Mes',
    'date': 'Fecha',
    'signerId': 'ID Firmante',
    'signerName': 'Firmante',
    'username': 'Usuario',
    'status': 'Estado',
    'userId': 'ID Usuario',
    'fullName': 'Nombre Completo',
    'module': 'Módulo',
    'action': 'Acción',
    'day': 'Día',
    // Resumen
    'totalDocuments': 'Total de Documentos',
    'totalFolios': 'Total de Folios',
    'signedDocuments': 'Documentos Firmados',
    'ocrDocuments': 'Documentos con OCR',
    'unsignedDocuments': 'Documentos Sin Firmar',
    'pendingOcr': 'OCR Pendiente',
    'totalSignatures': 'Total de Firmas',
    'validSignatures': 'Firmas Válidas',
    'revertedSignatures': 'Firmas Revertidas',
    'invalidSignatures': 'Firmas Inválidas',
    'activeFlows': 'Flujos Activos',
    'completedFlows': 'Flujos Completados',
    'totalActions': 'Total de Acciones',
    'uniqueUsers': 'Usuarios Únicos',
    'uniqueModules': 'Módulos Únicos',
    'uniqueActions': 'Acciones Únicas',
  };

  const sectionTitles: Record<string, string> = {
    'documentsByType': 'DOCUMENTOS POR TIPO',
    'documentsByOffice': 'DOCUMENTOS POR OFICINA',
    'documentsByMonth': 'DOCUMENTOS POR MES',
    'activityByUser': 'ACTIVIDAD POR USUARIO',
    'activityByModule': 'ACTIVIDAD POR MÓDULO',
    'activityByAction': 'ACTIVIDAD POR ACCIÓN',
    'activityByDay': 'ACTIVIDAD POR DÍA',
    'signaturesBySigner': 'FIRMAS POR FIRMANTE',
    'signaturesByStatus': 'FIRMAS POR ESTADO',
    'signaturesByDay': 'FIRMAS POR DÍA',
  };

  // Tablas de datos
  const sections = Object.entries(reportData).filter(([key]) => key !== 'summary');

  for (const [sectionKey, sectionData] of sections) {
    // Verificar si necesita nueva página
    if (helpers.yPosition < 200) {
      await addFooter(helpers, pdfDoc.getPages().length, pdfDoc.getPages().length + 1);
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      helpers.page = currentPage;
      helpers.yPosition = pageHeight - margin - 50;
    }

    const sectionTitle = sectionTitles[sectionKey] || sectionKey.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    addSection(helpers, sectionTitle);

    if (Array.isArray(sectionData) && sectionData.length > 0) {
      // Obtener las claves originales y traducir
      const originalKeys = Object.keys(sectionData[0]);
      const headers = originalKeys.map(k => fieldTranslations[k] || k.replace(/([A-Z])/g, ' $1').trim());
      
      // Filtrar columnas de IDs (no mostrar UUIDs largos)
      const visibleIndices = originalKeys.map((k, i) => 
        !k.toLowerCase().includes('id') || k.toLowerCase().includes('name') ? i : -1
      ).filter(i => i !== -1);

      const filteredHeaders = visibleIndices.map(i => headers[i]);
      const filteredKeys = visibleIndices.map(i => originalKeys[i]);

      const rows = sectionData.slice(0, 15).map(item =>
        filteredKeys.map(key => {
          const value = item[key];
          if (value === null || value === undefined) return '';
          // Limitar longitud de texto
          const strValue = String(value);
          return strValue.length > 40 ? strValue.substring(0, 37) + '...' : strValue;
        })
      );

      const columnWidth = (pageWidth - 2 * margin) / filteredHeaders.length;
      const columnWidths = filteredHeaders.map(() => columnWidth);

      drawTable(helpers, filteredHeaders, rows, columnWidths);
    }
  }

  // Footer en todas las páginas
  const pages = pdfDoc.getPages();
  for (let index = 0; index < pages.length; index++) {
    const tempHelpers = { ...helpers, page: pages[index] };
    await addFooter(tempHelpers, index + 1, pages.length);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

const exportToExcel = async (reportData: any, reportName: string): Promise<Buffer> => {
  // Get system configuration
  const config = await configurationService.getSystemConfig();
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = config.companyName || 'Sistema de Archivo Digital DISA CHINCHEROS';
  workbook.created = new Date();
  workbook.company = config.companyName || 'DISA CHINCHEROS';

  // Colores corporativos para Excel
  const excelColors = {
    primary: '2E4F8F', // Azul corporativo
    secondary: '228B22', // Verde
    accent: 'F29D12', // Naranja
    lightGray: 'F5F5F5',
    headerBg: '2E4F8F',
    headerText: 'FFFFFF',
  };

  // Hoja de portada
  const coverSheet = workbook.addWorksheet('Portada', {
    views: [{ showGridLines: false }]
  });

  // Logo (si existe)
  try {
    let logoPath: string | null = null;
    
    // Try to use configured logo
    if (config.logoUrl) {
      const urlParts = config.logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const configLogoPath = path.join(process.cwd(), 'uploads', 'system-config', fileName);
      if (fs.existsSync(configLogoPath)) {
        logoPath = configLogoPath;
      }
    }
    
    // Fallback to default logo
    if (!logoPath) {
      const defaultLogoPath = path.join(__dirname, '../../assets/logo.png');
      if (fs.existsSync(defaultLogoPath)) {
        logoPath = defaultLogoPath;
      }
    }

    if (logoPath) {
      const logoId = workbook.addImage({
        filename: logoPath,
        extension: 'png',
      });

      coverSheet.addImage(logoId, {
        tl: { col: 1, row: 1 },
        ext: { width: 150, height: 80 },
      });
    }
  } catch (error) {
    console.error('Error cargando logo en Excel:', error);
  }

  // Título del reporte
  coverSheet.mergeCells('A8:F8');
  const titleCell = coverSheet.getCell('A8');
  titleCell.value = reportName.toUpperCase();
  titleCell.font = { size: 22, bold: true, color: { argb: excelColors.primary } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Información de la empresa
  coverSheet.mergeCells('A10:F10');
  const companyCell = coverSheet.getCell('A10');
  companyCell.value = config.companyName || 'DISA CHINCHEROS';
  companyCell.font = { size: 14, bold: true, color: { argb: excelColors.primary } };
  companyCell.alignment = { horizontal: 'center' };

  coverSheet.mergeCells('A11:F11');
  const systemCell = coverSheet.getCell('A11');
  systemCell.value = config.companyTagline || 'Sistema de Archivo Digital';
  systemCell.font = { size: 11, color: { argb: '666666' } };
  systemCell.alignment = { horizontal: 'center' };

  // Company email if available
  if (config.companyEmail) {
    coverSheet.mergeCells('A12:F12');
    const emailCell = coverSheet.getCell('A12');
    emailCell.value = `Email: ${config.companyEmail}`;
    emailCell.font = { size: 9, color: { argb: '666666' } };
    emailCell.alignment = { horizontal: 'center' };
  }

  // Fecha de generación
  coverSheet.mergeCells('A13:F13');
  const dateCell = coverSheet.getCell('A13');
  dateCell.value = `Fecha de Generación: ${new Date().toLocaleString('es-PE')}`;
  dateCell.font = { size: 10, color: { argb: '666666' } };
  dateCell.alignment = { horizontal: 'center' };

  // Hoja de resumen con diseño profesional
  if (reportData.summary) {
    const summarySheet = workbook.addWorksheet('Resumen Ejecutivo');
    
    // Logo en la hoja de resumen
    try {
      const logoPath = path.join(__dirname, '../../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        const logoId = workbook.addImage({
          filename: logoPath,
          extension: 'png',
        });
        summarySheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 100, height: 50 },
        });
      }
    } catch (error) {
      console.error('Error cargando logo en hoja de resumen:', error);
    }

    // Header de la hoja
    summarySheet.mergeCells('A1:C1');
    const headerCell = summarySheet.getCell('A1');
    headerCell.value = 'RESUMEN EJECUTIVO';
    headerCell.font = { size: 16, bold: true, color: { argb: excelColors.headerText } };
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: excelColors.headerBg },
    };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 30;

    // Espacio
    summarySheet.getRow(2).height = 10;

    // Encabezados de la tabla
    summarySheet.columns = [
      { key: 'metric', width: 35 },
      { key: 'value', width: 20 },
      { key: 'spacer', width: 5 }
    ];

    const headerRow = summarySheet.getRow(3);
    headerRow.values = ['Métrica', 'Valor', ''];
    headerRow.font = { bold: true, size: 11, color: { argb: excelColors.headerText } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: excelColors.primary },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Datos del resumen
    let rowIndex = 4;
    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const row = summarySheet.getRow(rowIndex);
      row.values = [label, String(value), ''];
      
      row.getCell(1).font = { size: 10 };
      row.getCell(2).font = { size: 11, bold: true, color: { argb: excelColors.primary } };
      row.getCell(2).alignment = { horizontal: 'right' };

      // Fondo alternado
      if (rowIndex % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: excelColors.lightGray },
          };
        });
      }

      // Bordes
      row.eachCell((cell, colNumber) => {
        if (colNumber <= 2) {
          cell.border = {
            top: { style: 'thin', color: { argb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
            left: { style: 'thin', color: { argb: 'CCCCCC' } },
            right: { style: 'thin', color: { argb: 'CCCCCC' } },
          };
        }
      });

      rowIndex++;
    });
  }

  // Hojas de datos detallados
  const sections = Object.entries(reportData).filter(([key]) => key !== 'summary');

  sections.forEach(([sectionKey, sectionData]) => {
    if (Array.isArray(sectionData) && sectionData.length > 0) {
      const sheetName = sectionKey.replace(/([A-Z])/g, ' $1').trim().substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      // Header de la hoja
      const numColumns = Object.keys(sectionData[0]).length;
      sheet.mergeCells(1, 1, 1, numColumns);
      const sheetHeaderCell = sheet.getCell(1, 1);
      sheetHeaderCell.value = sheetName.toUpperCase();
      sheetHeaderCell.font = { size: 14, bold: true, color: { argb: excelColors.headerText } };
      sheetHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: excelColors.headerBg },
      };
      sheetHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 30;

      // Configurar columnas
      const columns = Object.keys(sectionData[0]).map(key => ({
        header: key.replace(/([A-Z])/g, ' $1').trim(),
        key,
        width: 20
      }));

      // Agregar encabezados en la fila 3
      sheet.getRow(3).values = columns.map(col => col.header);
      const headerRow = sheet.getRow(3);
      headerRow.font = { bold: true, size: 11, color: { argb: excelColors.headerText } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: excelColors.primary },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;

      // Agregar bordes al header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: excelColors.primary } },
          bottom: { style: 'medium', color: { argb: excelColors.primary } },
          left: { style: 'thin', color: { argb: excelColors.headerText } },
          right: { style: 'thin', color: { argb: excelColors.headerText } },
        };
      });

      // Datos
      let dataRowIndex = 4;
      sectionData.forEach((item, index) => {
        const row = sheet.getRow(dataRowIndex);
        row.values = columns.map(col => String(item[col.key] || ''));

        // Fondo alternado
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: excelColors.lightGray },
            };
          });
        }

        // Bordes
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
            left: { style: 'thin', color: { argb: 'CCCCCC' } },
            right: { style: 'thin', color: { argb: 'CCCCCC' } },
          };
          cell.alignment = { vertical: 'middle' };
        });

        dataRowIndex++;
      });

      // Ajustar anchos de columna
      columns.forEach((col, index) => {
        sheet.getColumn(index + 1).width = col.width;
      });

      // Agregar autofiltro
      sheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: columns.length }
      };

      // Congelar primera fila
      sheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 3 }
      ];
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const exportToCSV = (reportData: any, reportName: string): Buffer => {
  const rows: any[] = [];

  // Encabezado corporativo
  rows.push(['═'.repeat(80)]);
  rows.push(['DISA CHINCHEROS - SISTEMA DE ARCHIVO DIGITAL']);
  rows.push(['═'.repeat(80)]);
  rows.push([]);
  rows.push(['Reporte:', reportName.toUpperCase()]);
  rows.push(['Fecha de Generación:', new Date().toLocaleString('es-PE')]);
  rows.push(['Usuario:', 'Sistema']);
  rows.push([]);
  rows.push(['═'.repeat(80)]);
  rows.push([]);

  // Resumen Ejecutivo
  if (reportData.summary) {
    rows.push(['RESUMEN EJECUTIVO']);
    rows.push(['─'.repeat(40)]);
    
    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      rows.push([label, String(value)]);
    });
    
    rows.push([]);
    rows.push(['═'.repeat(80)]);
    rows.push([]);
  }

  // Secciones de datos detallados
  const sections = Object.entries(reportData).filter(([key]) => key !== 'summary');

  sections.forEach(([sectionKey, sectionData], sectionIndex) => {
    if (Array.isArray(sectionData) && sectionData.length > 0) {
      const sectionTitle = sectionKey.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
      
      rows.push([`SECCIÓN ${sectionIndex + 1}: ${sectionTitle}`]);
      rows.push(['─'.repeat(40)]);
      rows.push([]);

      // Headers con formato
      const headers = Object.keys(sectionData[0]).map(h => 
        h.replace(/([A-Z])/g, ' $1').trim().toUpperCase()
      );
      rows.push(headers);
      rows.push(['─'.repeat(headers.length)]);

      // Datos
      sectionData.forEach(item => {
        rows.push(headers.map((_, index) => {
          const key = Object.keys(sectionData[0])[index];
          const value = item[key];
          return value !== null && value !== undefined ? String(value) : '';
        }));
      });

      rows.push([]);
      rows.push(['═'.repeat(80)]);
      rows.push([]);
    }
  });

  // Footer
  rows.push([]);
  rows.push(['─'.repeat(80)]);
  rows.push(['Documento generado por Sistema de Archivo Digital DISA CHINCHEROS']);
  rows.push([`Total de registros en este reporte: ${
    sections.reduce((sum, [_, data]) => 
      sum + (Array.isArray(data) ? data.length : 0), 0
    )
  }`]);
  rows.push(['Para más información, contacte al administrador del sistema']);
  rows.push(['─'.repeat(80)]);

  const csvContent = stringify(rows);
  return Buffer.from(csvContent, 'utf-8');
};

export default {
  generateDocumentReport,
  generateUserActivityReport,
  generateSignatureReport,
  exportReport
};
