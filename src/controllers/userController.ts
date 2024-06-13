import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { body, validationResult } from 'express-validator';

export const getMe = async (req: Request, res: Response) => {
  res.json(req.user);
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = [
  body('firstName').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('role').isIn(['SUPERVISOR','CLIENT']).withMessage('Role must be either SUPERVISOR or CLIENT'),
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

      if(req?.user?.role == "SUPERVISOR" && req.body.role == "SUPERVISOR"){
        return res.status(400).json({ error: 'You cannot create a supervisor' });
      }

      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
]


export const disableUser = async (req: Request, res: Response) => {
  try {
    const IdUser  = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if(!user) return res.status(404).json({ error: 'User not found' });

    if(req?.user?.id === IdUser) return res.status(400).json({ error: 'You cannot disable yourself' });

    if(user.isDisabled === true) return res.status(400).json({ error: 'You cannot disable an already disabled user' });

    if(user.role === 'ADMIN') return res.status(400).json({ error: 'You cannot disable an admin' });

    await userService.disableUser(IdUser);
    res.status(200).json({ message: 'User disabled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable user' });
  }
}

export const enableUser = async (req: Request, res: Response) => {
  try {
    const IdUser  = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if(!user) return res.status(404).json({ error: 'User not found' });

    if(req?.user?.id === IdUser) return res.status(400).json({ error: 'You cannot disable yourself' });

    if(user.isDisabled === false) return res.status(400).json({ error: 'User already enabled' });

    if(user.role === 'ADMIN') return res.status(400).json({ error: 'You cannot enable an admin' });

    await userService.enableUser(IdUser);
    res.status(200).json({ message: 'User enabled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable user' });
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const IdUser  = Number(req.params.id);
    const user = await userService.getUserById(IdUser);

    if(!user) return res.status(404).json({ error: 'User not found' });

    if(req?.user?.id === IdUser) return res.status(400).json({ error: 'You cannot delete yourself' });

    await userService.deleteUser(IdUser);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

