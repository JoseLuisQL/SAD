import { Request, Response } from 'express';
import * as analyticsService from '../services/signature-analytics.service';

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ error: 'dateFrom and dateTo are required' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const metrics = await analyticsService.getSignatureMetrics(from, to);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting signature metrics:', error);
    res.status(500).json({ error: 'Failed to get signature metrics' });
  }
};

export const getByPeriod = async (req: Request, res: Response) => {
  try {
    const { period, dateFrom, dateTo } = req.query;

    if (!period || !dateFrom || !dateTo) {
      res.status(400).json({ error: 'period, dateFrom and dateTo are required' });
      return;
    }

    if (!['day', 'week', 'month'].includes(period as string)) {
      res.status(400).json({ error: 'period must be day, week, or month' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const data = await analyticsService.getSignaturesByPeriod(
      period as 'day' | 'week' | 'month',
      from,
      to
    );
    res.json(data);
  } catch (error) {
    console.error('Error getting signatures by period:', error);
    res.status(500).json({ error: 'Failed to get signatures by period' });
  }
};

export const getByUser = async (req: Request, res: Response) => {
  try {
    const { limit = '10', dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ error: 'dateFrom and dateTo are required' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      res.status(400).json({ error: 'limit must be a positive number' });
      return;
    }

    const data = await analyticsService.getSignaturesByUser(limitNum, from, to);
    res.json(data);
  } catch (error) {
    console.error('Error getting signatures by user:', error);
    res.status(500).json({ error: 'Failed to get signatures by user' });
  }
};

export const getFlowStats = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ error: 'dateFrom and dateTo are required' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const data = await analyticsService.getFlowStatistics(from, to);
    res.json(data);
  } catch (error) {
    console.error('Error getting flow statistics:', error);
    res.status(500).json({ error: 'Failed to get flow statistics' });
  }
};

export const getDocumentTypes = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ error: 'dateFrom and dateTo are required' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const data = await analyticsService.getDocumentTypeDistribution(from, to);
    res.json(data);
  } catch (error) {
    console.error('Error getting document type distribution:', error);
    res.status(500).json({ error: 'Failed to get document type distribution' });
  }
};

export const getReversionStats = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      res.status(400).json({ error: 'dateFrom and dateTo are required' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const data = await analyticsService.getReversionAnalytics(from, to);
    res.json(data);
  } catch (error) {
    console.error('Error getting reversion analytics:', error);
    res.status(500).json({ error: 'Failed to get reversion analytics' });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type, dateFrom, dateTo } = req.query;

    if (!type || !dateFrom || !dateTo) {
      res.status(400).json({ error: 'type, dateFrom and dateTo are required' });
      return;
    }

    if (!['pdf', 'xlsx', 'csv'].includes(type as string)) {
      res.status(400).json({ error: 'type must be pdf, xlsx, or csv' });
      return;
    }

    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const { buffer, filename, mimeType } = await analyticsService.exportAnalyticsReport(
      type as 'pdf' | 'xlsx' | 'csv',
      from,
      to
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: error.message || 'Failed to export report' });
  }
};
