import { Request, Response } from 'express';
import * as searchService from '../services/search.service';

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query,
      documentNumber,
      dateFrom,
      dateTo,
      documentTypeId,
      sender,
      officeId,
      archivadorId,
      periodId,
      expedienteId,
      page,
      limit,
      sortField,
      sortOrder,
      source
    } = req.query;

    const searchQuery = (query as string) || '';
    const searchSource = (source as 'manual' | 'saved' | 'preset') || 'manual';
    
    console.log('=== BÚSQUEDA RECIBIDA ===');
    console.log('Query:', searchQuery);
    console.log('Source:', searchSource);
    console.log('Todos los params:', req.query);

    const filters: any = {};
    
    if (documentNumber) filters.documentNumber = documentNumber as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (documentTypeId) filters.documentTypeId = documentTypeId as string;
    if (sender) filters.sender = sender as string;
    if (officeId) filters.officeId = officeId as string;
    if (archivadorId) filters.archivadorId = archivadorId as string;
    if (periodId) filters.periodId = periodId as string;
    if (expedienteId) filters.expedienteId = expedienteId as string;

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };

    const sort = {
      field: sortField as string || 'documentDate',
      order: (sortOrder as 'asc' | 'desc') || 'desc'
    };

    console.log('Filtros procesados:', filters);
    console.log('Paginación:', pagination);

    const result = await searchService.searchDocuments(
      searchQuery,
      filters,
      pagination,
      sort,
      req,
      searchSource
    );

    console.log('Resultados encontrados:', result.total);

    res.status(200).json({
      status: 'success',
      message: 'Búsqueda completada correctamente',
      data: result.documents,
      pagination: {
        page: result.page,
        total: result.total,
        totalPages: result.totalPages
      },
      searchInfo: result.searchInfo
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al realizar la búsqueda'
    });
  }
};

export const suggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'El parámetro "q" es requerido'
      });
      return;
    }

    const suggestionsList = await searchService.getSearchSuggestions(q);

    res.status(200).json({
      status: 'success',
      message: 'Sugerencias obtenidas correctamente',
      data: suggestionsList
    });
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener sugerencias'
    });
  }
};

export default {
  search,
  suggestions
};
