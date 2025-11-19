import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthTokenPayload;
  }
}

const JWT_SECRET: jwt.Secret = ENV.JWT_SECRET;

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token nao informado' });
  }

  try {
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token invalido' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
      return res.status(401).json({ message: 'Token invalido' });
    }
    const { sub, role } = decoded as jwt.JwtPayload;
    if (typeof sub !== 'string' || typeof role !== 'string') {
      return res.status(401).json({ message: 'Token invalido' });
    }
    req.user = { sub, role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalido' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};
