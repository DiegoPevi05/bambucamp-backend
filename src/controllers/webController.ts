import { Request, Response } from 'express';
import * as webService from '../services/webService';
import { CustomError } from '../middleware/errors';
import { body, validationResult } from 'express-validator';

export const contactForm = [
  body('name').notEmpty().withMessage("validation.nameRequired"),
  body('email').notEmpty().withMessage("validation.emailRequired"),
  body('message').notEmpty().withMessage("validation.messageRequired"),

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
      await webService.contactForm(req.body, language);
      res.status(201).json({ message: req.t("message.messageSended") });
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToSendContactForm") });
      }
    }
  }
]

export const complaintForm = [
  body('name').notEmpty().withMessage("validation.nameRequired"),
  body('email').notEmpty().withMessage("validation.emailRequired"),
  body('phone').notEmpty().withMessage("validation.phoneRequired"),
  body('documentId').notEmpty().withMessage("validation.documentIdRequired"),
  body('claimType').notEmpty().withMessage("validation.claimTypeRequired"),
  body('description').notEmpty().withMessage("validation.complaintDescriptionRequired"),

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
      await webService.complaintForm(req.body, language);
      res.status(201).json({ message: req.t("message.complaintSubmitted") });
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToSendComplaintForm") });
      }
    }
  }
]

export const getWebContent = async (req: Request, res: Response) => {
  try {
    const webContent = await webService.getWebContent();
    res.json(webContent);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchWebContent") });
    }
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {

    const { page = '1', pageSize = '10' } = req.query;

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const reviews = await webService.getAllReviews(pagination);
    res.json(reviews);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchReviews") });
    }
  }
};

export const createReview = [
  body('name').notEmpty().withMessage("validation.nameRequired"),
  body('title').notEmpty().withMessage("validation.titleRequired"),
  body('review').notEmpty().withMessage("validation.reviewRequired"),
  body('day').notEmpty().withMessage("validation.dayRequired"),
  body('stars').notEmpty().withMessage("validation.starsRequired"),

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
      await webService.createReview(req.body);
      res.status(201).json({ message: req.t("message.reviewCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateReview") });
      }
    }
  }
];

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await webService.deleteReview(Number(req.params.id));

    res.json({ message: req.t("message.reviewDeleted") });
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("failedToDeleteReview") });
    }
  }
};

export const getAllPublicFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await webService.getAllPublicFaqs();
    res.json(faqs);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchFaqs") });
    }
  }
};

export const getAllFaqs = async (req: Request, res: Response) => {
  try {

    const { page = '1', pageSize = '10' } = req.query;

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const faqs = await webService.getAllFaqs(pagination);
    res.json(faqs);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchFaqs") });
    }
  }
};

export const createFaq = [
  body('question').notEmpty().withMessage("validation.questionRequired"),
  body('answer').notEmpty().withMessage("validation.answerRequired"),

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
      await webService.createFaq(req.body);
      res.status(201).json({ message: req.t("message.faqCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateFaq") });
      }
    }
  }
];

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    await webService.deleteFaq(Number(req.params.id));

    res.json({ message: req.t("message.faqDeleted") });
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("failedToDeleteFaq") });
    }
  }
};
