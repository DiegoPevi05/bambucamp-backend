import { Request, Response } from 'express';
import * as reserveService from '../services/reserveService';
import { body, query, param, validationResult } from 'express-validator';
import { CustomError } from '../middleware/errors';
import { PaymentStatus } from '@prisma/client';
import { formatStrToDate } from '../lib/utils';
import { ReserveEntityType } from '../dto/reserve';

export const getCalendarDates = async (req: Request, res: Response) => {
  try {
    const { page = '0' } = req.query;

    const pageParsed = parseInt(page as string, 10);

    const PaginatedReserves = await reserveService.getCalendarDates(pageParsed);

    res.json(PaginatedReserves);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
}

export const getAllPublicTentsForReservation = [
  query('dateFrom').notEmpty().withMessage('validation.dateFromRequired'),
  query('dateTo').notEmpty().withMessage('validation.dateToRequired'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }
    try {

      const { dateFrom, dateTo } = req.query;

      const tents = await reserveService.searchAvailableTents(dateFrom as string, dateTo as string);
      res.json(tents);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToFetchTents") });
      }
    }
  }
]

export const getAdminTentsForReservation = [
  query('dateFrom').notEmpty().withMessage('validation.dateFromRequired'),
  query('dateTo').notEmpty().withMessage('validation.dateToRequired'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }
    try {

      const { dateFrom, dateTo } = req.query;

      const tents = await reserveService.searchAdminAvailableTents(dateFrom as string, dateTo as string);
      res.json(tents);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToFetchTents") });
      }
    }
  }
]

export const getAllMyReservesCalendarUser = async (req: Request, res: Response) => {
  try {
    const { page = '0' } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: req.t('error.unauthorized') });
    };

    const pageParsed = parseInt(page as string, 10);

    const PaginatedReserves = await reserveService.getAllMyReservesCalendarUser(pageParsed, req.user.id);

    res.json(PaginatedReserves);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
}

export const getAllMyReservesCalendar = async (req: Request, res: Response) => {
  try {
    const { page = '0' } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: req.t('error.unauthorized') });
    };

    const pageParsed = parseInt(page as string, 10);

    const PaginatedReserves = await reserveService.getAllMyReservesCalendar(pageParsed);

    res.json(PaginatedReserves);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
}


export const getAllMyReservesUser = async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10' } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: req.t('error.unauthorized') });
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedReserves = await reserveService.getAllMyReservesUser(pagination, req.user.id);

    res.json(PaginatedReserves);

  } catch (error) {
    console.log(error)
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
}


export const getAllMyReservesAdmin = async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10' } = req.query;

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedReserves = await reserveService.getAllMyReserves(pagination);

    res.json(PaginatedReserves);

  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
}

export const getAllReserveOptions = async (req: Request, res: Response) => {
  try {
    const reserveOptions = await reserveService.getAllReseveOptions();
    res.json(reserveOptions);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserveOptions') });
    }
  }
}


export const getAllReserves = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, payment_status, page = '1', pageSize = '10' } = req.query;

    const filters = {
      dateFrom: formatStrToDate(dateFrom as string) as Date | undefined,
      dateTo: formatStrToDate(dateTo as string) as Date | undefined,
      payment_status: payment_status as PaymentStatus | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedReserves = await reserveService.getAllReserves(filters, pagination);

    res.json(PaginatedReserves);

  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
};


export const downloadReserveBill = [
  param('id').notEmpty().withMessage("validation.idRequired"),
  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      // Generate PDF as a byte array
      const pdfBuffer = await reserveService.downloadReserveBill(Number(req.params.id), req.user, req.t);

      // Set response headers and send PDF as a byte array
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=reserve_${req.params.id}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToDownloadBill') });
      }
    }
  }
]

export const createReserveByUser = [
  body('tents').isArray().withMessage('validation.tentsMustBeArray'),
  body('products').isArray().withMessage('validation.productsMustBeArray'),
  body('experiences').isArray().withMessage('validation.experiencesMustBeArray'),
  body('user_firstname').notEmpty().withMessage('validation.nameRequired'),
  body('user_lastname').notEmpty().withMessage('validation.lastNameRequired'),
  body('user_phone_number').notEmpty().withMessage('validation.phoneNumberRequired'),
  body('user_document_type').notEmpty().withMessage('validation.documentTypeRequired'),
  body('user_document_id').notEmpty().withMessage('validation.documentIdRequired'),
  body('user_email').isEmail().withMessage('validation.emailInvalid'),
  body('eta').notEmpty().withMessage('validation.etaRequired'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {

      const language = req.language || 'en';
      const { external_id, gross_import  } = await reserveService.createReserveByUser(req.body, language);
      res.status(201).json({ 
        message: req.t('message.reserveCreatedByUser'), 
        external_id,
        gross_import
      });
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateReserve') });
      }
    }
  }
];

export const createReserve = [
  body('tents').isArray().withMessage('validation.tentsMustBeArray'),
  body('products').isArray().withMessage('validation.productsMustBeArray'),
  body('experiences').isArray().withMessage('validation.experiencesMustBeArray'),
  body('user_firstname').notEmpty().withMessage('validation.nameRequired'),
  body('user_lastname').notEmpty().withMessage('validation.lastNameRequired'),
  body('user_phone_number').notEmpty().withMessage('validation.phoneNumberRequired'),
  body('user_document_type').notEmpty().withMessage('validation.documentTypeRequired'),
  body('user_document_id').notEmpty().withMessage('validation.documentIdRequired'),
  body('user_email').isEmail().withMessage('validation.emailInvalid'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {

      const language = req.language || 'en';
      await reserveService.createReserve(req.body, language);
      res.status(201).json({ message: req.t('message.reserveCreated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateReserve') });
      }
    }
  }
];

export const updateReserve = [
  param('id').notEmpty().withMessage('validation.idRequired'),
  body('tents').isArray().withMessage('validation.tentsMustBeArray'),
  body('products').isArray().withMessage('validation.productsMustBeArray'),
  body('experiences').isArray().withMessage('validation.experiencesMustBeArray'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await reserveService.updateReserve(Number(req.params.id), req.body);
      res.json({ message: req.t('message.reserveUpdated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToUpdateReserve') });
      }

    }
  }
];

export const deleteReserve = async (req: Request, res: Response) => {
  try {
    await reserveService.deleteReserve(Number(req.params.id));
    res.json({ message: req.t('message.reserveDeleted') });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToDeleteReserve') });
    }
  }
};

export const createProductReserveByUser = [
  body('products').isArray().withMessage('validation.productsMustBeArray'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      if (req.user) {
        await reserveService.AddProductReserveByUser(req.user.id, req.body.products);
        res.status(201).json({ message: req.t('message.productReserveCreated') });
      }
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateProductReserve') });
      }
    }
  }
];



export const createProductReserve = [
  body('products').isArray().withMessage('validation.productsMustBeArray'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await reserveService.AddProductReserve(null, req.body.products);
      res.status(201).json({ message: req.t('message.productReserveCreated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateProductReserve') });
      }
    }
  }
];


export const deleteProductReserve = [
  param('id').notEmpty().withMessage("validation.idRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await reserveService.deleteProductReserve(Number(req.params.id));
      res.status(201).json({ message: req.t('message.productReserveDeleted') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToDeleteProductReserve') });
      }
    }
  }
];


export const createExperienceReserveByUser = [
  body('experiences').isArray().withMessage('validation.experiencesMustBeArray'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      if (req.user) {
        await reserveService.AddExperienceReserveByUser(req.user.id, req.body.experiences);
        res.status(201).json({ message: req.t('message.experienceReserveCreated') });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateExperienceReserve') });
      }
    }
  }
];



export const createExperienceReserve = [
  body('experiences').isArray().withMessage('validation.experiencesMustBeArray'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await reserveService.AddExperienceReserve(null, req.body.experiences);
      res.status(201).json({ message: req.t('message.experienceReserveCreated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateExperienceReserve') });
      }
    }
  }
];


export const deleteExperienceReserve = [
  param('id').notEmpty().withMessage("validation.idRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await reserveService.deleteExperienceReserve(Number(req.params.id));
      res.status(201).json({ message: req.t('message.experienceReserveDeleted') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToDeleteExperienceReserve') });
      }
    }
  }
];

export const confirmEntity = [
  // Validate that 'entityType' and 'reserveId' exist
  body('entityType').notEmpty().withMessage('validation.entityTypeRequired'),
  body('reserveId').notEmpty().isInt().withMessage('validation.reserveIdRequired'),
  body('entityId').optional().isInt().withMessage('validation.entityIdInvalid'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg),
      }));
      return res.status(400).json({ error: localizedErrors });
    }

    try {
      const { entityType, reserveId, entityId } = req.body;

      const language = req.language || 'en';
      // Call the confirmEntity function
      await reserveService.confirmEntity(entityType, reserveId, language, entityId);

      res.status(201).json({ message: req.t((entityType == ReserveEntityType.RESERVE ? 'message.reserveConfirmed' : 'message.entityConfirmed'), { entityType }) });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToConfirmEntity') });
      }
    }
  },
];
