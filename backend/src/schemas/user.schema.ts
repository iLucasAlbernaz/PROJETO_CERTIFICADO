import { z } from 'zod';

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN']).default('ADMIN')
});

export const userUpdateSchema = z.object({
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN']).optional()
});
