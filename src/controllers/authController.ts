import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { SignInRequest, SignInResponse } from '../dto/user';
import { body, query, validationResult } from 'express-validator';


export const signUp = [

  body('firstName').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await authService.signUp(req.body);
      res.status(201).json({ message: "Email verification link has been sent to your email" });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
] 

export const verifyAccount = [

  query('email').isEmail().withMessage('Must be a valid email'),
  query('code').notEmpty().withMessage('Code is required'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, code } = req.query;
      await authService.verifyEmail(email as string, code as string);
      res.status(200).json({ message: "Email successfully verified" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
];

export const forgotPassword = [

  body('email').isEmail().withMessage('Must be a valid email'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await authService.resetPassword(req.body.email);
      res.status(200).json({ message: "Password reset link has been sent to your email" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
];

export const verifyPasswordResetCode = [
  
  body('email').isEmail().withMessage('Must be a valid email'),
  body('code').notEmpty().withMessage('Code is required'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, code } = req.body;
      await authService.verifyPasswordResetCode(email, code);
      res.status(200).json({ message: "Code successfully verified" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
];

export const updatePassword = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
  body('code').notEmpty().withMessage('Code is required'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, code } = req.body;
      await authService.updatePassword(email, password, code);
      res.status(200).json({ message: "Password successfully updated" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
];

export const signIn = [

  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),

  async (req: Request<{}, {}, SignInRequest>, res: Response) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.signIn(email, password);
      const signInResponse: SignInResponse = { token, user };
      res.json(signInResponse);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
]




