import { Request, Response } from 'express';
import * as statisticService from '../services/statisticService';
import {CustomError} from '../middleware/errors';

export const getNetSalesStatistics = async (req: Request, res: Response) => {
    try {
    const { step = 'W', type = 'P' } = req.query;

    const SalesFilters = {
      step: step as "W"|"M"|"Y",
      type: type as "A"|"P",
    };

    const language = req.language || 'en';
    const dates = await statisticService.getNetSalesStatistics(SalesFilters, language);

    res.json(dates);

    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: req.t('error.failedToFetchStatistics') });
      }
    }
}

export const getReserveQuantityStatistics = async (req: Request, res: Response) => {
    try {
    const { step = 'W', type = 'P' } = req.query;

    const SalesFilters = {
      step: step as "W"|"M"|"Y",
      type: type as "A"|"P",
    };

    const language = req.language || 'en';
    const dates = await statisticService.getReserveQuantityStatistics(SalesFilters, language);

    res.json(dates);

    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: req.t('error.failedToFetchStatistics') });
      }
    }
}
