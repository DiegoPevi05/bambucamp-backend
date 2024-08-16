import { Request, Response, NextFunction } from 'express';
import jwt ,{ JwtPayload } from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user: User | null = await userRepository.getUserById(payload.userId);
    if (!user) return res.sendStatus(404);
    req.user = user; 
    req.role = user.role;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

export const checkRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.role;
    if (!userRole) {
      return res.status(401).json({ error: req.t("error.unauthorized") });
    }
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: req.t("error.unauthorized") });
    }
    next();
  };
};
