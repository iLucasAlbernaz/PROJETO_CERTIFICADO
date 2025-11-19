import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { userCreateSchema, userUpdateSchema } from '../schemas/user.schema';
import { ENV } from '../config/env';

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true }
  });
  res.json(users);
});

usersRouter.post('/', async (req, res) => {
  const payload = userCreateSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(payload.password, ENV.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      role: payload.role
    },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  res.status(201).json(user);
});

usersRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID invalido' });
  }
  const payload = userUpdateSchema.parse(req.body);

  const data: { passwordHash?: string; role?: 'ADMIN' } = {};
  if (payload.password) {
    data.passwordHash = await bcrypt.hash(payload.password, ENV.BCRYPT_SALT_ROUNDS);
  }
  if (payload.role) {
    data.role = payload.role;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, createdAt: true }
  });

  res.json(user);
});

usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID invalido' });
  }
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});
