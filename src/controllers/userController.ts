import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { body, validationResult } from 'express-validator';
import { Role } from '@prisma/client';
import { CustomError } from '../middleware/errors';

// ────────────────────────────────────────────────────────────────
// Get current logged-in user
export const getMe = async (req: Request, res: Response) => {
  res.json(req.user);
};

// ────────────────────────────────────────────────────────────────
// Get all users (with filtering and pagination)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, role, page = '1', pageSize = '10' } = req.query;

    const filters = {
      firstName: firstname as string | undefined,
      lastName: lastname as string | undefined,
      email: email as string | undefined,
      role: role ? (role as keyof typeof Role) : undefined,
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const paginatedUsers = await userService.getAllUsers(filters, pagination);
    res.json(paginatedUsers);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchUsers") });
    }
  }
};

// ────────────────────────────────────────────────────────────────
// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: req.t("error.noUserFoundInDB") });
    }
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchUser") });
    }
  }
};

// ────────────────────────────────────────────────────────────────
// Create user
export const createUser = [
  body('firstName').notEmpty().withMessage('validation.nameRequired'),
  body('email').isEmail().withMessage('validation.emailInvalid'),
  body('role').isIn(['SUPERVISOR', 'CLIENT']).withMessage('validation.roleInvalid'),
  body('lastName').optional(),
  body('phoneNumber').optional(),
  body('document_id').optional(),
  body('document_type').optional(),
  body('password')
    .isLength({ min: 8 }).withMessage('validation.passwordLength')
    .matches(/[a-zA-Z]/).withMessage('validation.passwordLetter')
    .matches(/[0-9]/).withMessage('validation.passwordNumber')
    .matches(/[^a-zA-Z0-9]/).withMessage('validation.passwordSpecial'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      if (req?.user?.role === "SUPERVISOR" && req.body.role === "SUPERVISOR") {
        return res.status(400).json({ error: req.t("error.unauthorized") });
      }

      await userService.createUser(req.body);
      res.status(201).json({ message: req.t("message.userCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateUser") });
      }
    }
  }
];

// ────────────────────────────────────────────────────────────────
// Update user
export const updateUser = [
  body('firstName').notEmpty().withMessage('validation.nameRequired'),
  body('email').isEmail().withMessage('validation.emailInvalid'),
  body('role').isIn(['SUPERVISOR', 'CLIENT']).withMessage('validation.roleInvalid'),
  body('lastName').optional(),
  body('phoneNumber').optional(),
  body('document_id').optional(),
  body('document_type').optional(),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('validation.passwordLength')
    .matches(/[a-zA-Z]/).withMessage('validation.passwordLetter')
    .matches(/[0-9]/).withMessage('validation.passwordNumber')
    .matches(/[^a-zA-Z0-9]/).withMessage('validation.passwordSpecial'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      if (req?.user?.role === "SUPERVISOR" && (req.body.role === "SUPERVISOR" || req.body.role === "ADMIN")) {
        return res.status(400).json({ error: req.t("error.unauthorized") });
      }

      const IdUser = Number(req.params.id);
      const user = await userService.updateUser(IdUser, req.body);
      res.status(200).json({ message: req.t("message.userUpdated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateUser") });
      }
    }
  }
];

// ────────────────────────────────────────────────────────────────
// Disable user
export const disableUser = async (req: Request, res: Response) => {
  try {
    const IdUser = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if (!user) return res.status(404).json({ error: req.t("error.noUserFoundInDB") });
    if (req?.user?.id === IdUser) return res.status(400).json({ error: req.t("error.failedToDisabledYourself") });
    if (user.isDisabled === true) return res.status(400).json({ error: req.t("error.failedToDisableUser") });
    if (user.role === 'ADMIN') return res.status(400).json({ error: req.t("error.failedToDisableAdmin") });

    await userService.disableUser(IdUser);
    res.status(200).json({ message: req.t("message.userDisabled") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t("error.failedToDisableUser") });
    }
  }
};

// ────────────────────────────────────────────────────────────────
export const enableUser = async (req: Request, res: Response) => {
  try {
    const IdUser = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if (!user) return res.status(404).json({ error: req.t("error.noUserFoundInDB") });
    if (req?.user?.id === IdUser) return res.status(400).json({ error: req.t("error.failedToEnabledYourself") });
    if (user.isDisabled === false) return res.status(400).json({ error: req.t("error.failedToEnableUser") });
    if (user.role === 'ADMIN') return res.status(400).json({ error: req.t("error.failedToEnableAdmin") });

    await userService.enableUser(IdUser);
    res.status(200).json({ message: req.t("message.userEnabled") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t("error.failedToEnableUser") });
    }
  }
};

// ────────────────────────────────────────────────────────────────
// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const IdUser = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if (!user) return res.status(404).json({ error: req.t("error.noUserFoundInDB") });
    if (req?.user?.id === IdUser) return res.status(400).json({ error: req.t("error.failedToDeleteYourself") });

    await userService.deleteUser(IdUser);
    res.status(200).json({ message: req.t("message.userDeleted") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: req.t("error.failedToDeleteUser") });
    }
  }
};

