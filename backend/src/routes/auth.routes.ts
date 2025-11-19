import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { loginSchema } from '../schemas/auth.schema';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';

const JWT_SECRET: jwt.Secret = ENV.JWT_SECRET;
const SIGN_OPTIONS: jwt.SignOptions = {
  expiresIn: ENV.JWT_EXPIRES_IN as StringValue
};

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Credenciais invalidas' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Credenciais invalidas' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, SIGN_OPTIONS);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token invalido' });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuario nao encontrado' });
  }

  res.json(user);
});
