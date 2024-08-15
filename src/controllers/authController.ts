import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { SignInRequest, SignInResponse } from '../dto/user';
import { body, query, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';


export const signUp = [

  body('firstName').notEmpty().withMessage(req => req.t("validation.nameRequired")),
  body('lastName').notEmpty().withMessage(req => req.t("validation.lastNameRequired")),
  body('phoneNumber').notEmpty().withMessage(req => req.t("validation.phoneNumberRequired")),
  body('email').isEmail().withMessage(req => req.t("validation.emailInvalid")),
  body('password')
    .isLength({ min: 8 }).withMessage(req => req.t("validation.passwordLength"))
    .matches(/[a-zA-Z]/).withMessage('validation.passwordLetter')
    .matches(/[0-9]/).withMessage('validation.passwordNumber')
    .matches(/[^a-zA-Z0-9]/).withMessage('validation.passwordSpecial'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await authService.signUp(req.body);
      res.status(201).json({ message:req.t("message.emailVerificationSent") });
    } catch (error) {

      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateUser") });
      }
    }
  }
] 

export const verifyAccount = [

  query('email').isEmail().withMessage(req => req.t("validation.emailInvalid")),
  query('code').notEmpty().withMessage(req => req.t("validation.codeRequired")),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { email, code } = req.query;
      await authService.verifyEmail(email as string, code as string);
      res.status(200).json({ message: req.t("message.emailVerified") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToVerifyUser") });
      }
    }
  }
];

export const forgotPassword = [

  body('email').isEmail().withMessage(req => req.t("error.emailInvalid")),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await authService.resetPassword(req.body.email);
      res.status(200).json({ message: req.t("message.passwordResetSent") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToGenerateResetCode") });
      }
    }
  }
];

export const verifyPasswordResetCode = [
  
  body('email').isEmail().withMessage(req => req.t("validation.emailInvalid")),
  body('code').notEmpty().withMessage(req => req.t("validation.codeRequired")),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { email, code } = req.body;
      await authService.verifyPasswordResetCode(email, code);
      res.status(200).json({ message: "message.passwordResetCodeGenerated" });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: 'error.failedToVerifyPasswordResetCode' });
      }
    }
  }
];

export const updatePassword = [
  body('email').isEmail().withMessage(req => req.t("validation.emailInvalid")),
  body('password')
    .isLength({ min: 8 }).withMessage(req => req.t("validation.passwordLength"))
    .matches(/[a-zA-Z]/).withMessage(req => req.t('validation.passwordLetter'))
    .matches(/[0-9]/).withMessage(req => req.t("validation.passwordNumber"))
    .matches(/[^a-zA-Z0-9]/).withMessage(req => req.t("validation.passwordSpecial")),
  body('code').notEmpty().withMessage(req => req.t("validation.codeRequired")),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { email, password, code } = req.body;
      await authService.updatePassword(email, password, code);
      res.status(200).json({ message: req.t("message.passwordUpdateSuccess") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.passwordChangeFailed") });
      }
    }
  }
];

export const signIn = [

  body('email').isEmail().withMessage(req => req.t("validation.emailInvalid")),
  body('password').notEmpty().withMessage(req => req.t("validation.passwordRequired")),

  async (req: Request<{}, {}, SignInRequest>, res: Response) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.signIn(email, password);
      const signInResponse: SignInResponse = { token, user };
      res.json(signInResponse);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.loginFailed") });
      }
    }
  }
]




