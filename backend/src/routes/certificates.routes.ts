import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { certificateSchema, certificateUpdateSchema } from '../schemas/certificate.schema';
import { normalizeCPF } from '../utils/cpf';
import { requireAdmin, requireAuth } from '../middleware/auth';

export const certificatesRouter = Router();

certificatesRouter.get('/lookup/:cpf', async (req, res) => {
  const cpf = normalizeCPF(req.params.cpf);
  if (!cpf) {
    return res.status(400).json({ message: 'CPF inválido' });
  }

  const certificates = await prisma.certificate.findMany({
    where: { cpf },
    orderBy: { inicio: 'desc' }
  });

  if (!certificates.length) {
    return res.status(404).json({ message: 'Nenhum certificado encontrado' });
  }

  res.json(certificates);
});

certificatesRouter.use(requireAuth);

certificatesRouter.get('/', async (_req, res) => {
  const certificates = await prisma.certificate.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(certificates);
});

certificatesRouter.post('/', requireAdmin, async (req, res) => {
  const payload = certificateSchema.parse(req.body);

  const certificate = await prisma.certificate.create({
    data: {
      ...payload,
      cpf: normalizeCPF(payload.cpf)
    }
  });

  res.status(201).json(certificate);
});

certificatesRouter.put('/:id', requireAdmin, async (req, res) => {
  const payload = certificateUpdateSchema.parse(req.body);
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const data: Prisma.CertificateUpdateInput = {};
  if (payload.cpf) data.cpf = normalizeCPF(payload.cpf);
  if (payload.registro) data.registro = payload.registro;
  if (payload.matricula) data.matricula = payload.matricula;
  if (payload.nome) data.nome = payload.nome;
  if (payload.curso) data.curso = payload.curso;
  if (payload.inicio) data.inicio = payload.inicio;
  if (payload.fim) data.fim = payload.fim;

  const certificate = await prisma.certificate.update({
    where: { id },
    data
  });

  res.json(certificate);
});

certificatesRouter.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  await prisma.certificate.delete({ where: { id } });
  res.status(204).send();
});
