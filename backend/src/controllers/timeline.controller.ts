import { Request, Response } from 'express';
import * as timelineService from '../services/timeline.service';

export const getArchivadorTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const timeline = await timelineService.getArchivadorTimeline(id, pageNum, limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Timeline del archivador obtenido correctamente',
      data: timeline.events,
      pagination: timeline.pagination
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Archivador no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener timeline del archivador'
    });
  }
};

export const getDocumentTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const timeline = await timelineService.getDocumentTimeline(id, pageNum, limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Timeline del documento obtenido correctamente',
      data: timeline.events,
      pagination: timeline.pagination
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener timeline del documento'
    });
  }
};

export const getExpedienteTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const timeline = await timelineService.getExpedienteTimeline(id, pageNum, limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Timeline del expediente obtenido correctamente',
      data: timeline.events,
      pagination: timeline.pagination
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener timeline del expediente'
    });
  }
};

export const getUserTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const timeline = await timelineService.getUserTimeline(id, pageNum, limitNum);

    res.status(200).json({
      status: 'success',
      message: 'Timeline del usuario obtenido correctamente',
      data: timeline.events,
      pagination: timeline.pagination
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener timeline del usuario'
    });
  }
};

export default {
  getArchivadorTimeline,
  getDocumentTimeline,
  getExpedienteTimeline,
  getUserTimeline
};
