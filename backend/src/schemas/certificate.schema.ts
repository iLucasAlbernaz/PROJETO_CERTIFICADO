import { z } from 'zod';

export const certificateSchema = z.object({
  cpf: z.string().min(11).max(14),
  registro: z.string().min(1),
  matricula: z.string().min(1),
  nome: z.string().min(1),
  curso: z.string().min(1),
  inicio: z.coerce.date(),
  fim: z.coerce.date()
});

export const certificateUpdateSchema = certificateSchema.partial();
