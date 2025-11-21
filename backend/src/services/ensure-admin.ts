import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';

export const ensureAdminUser = async () => {
  const adminEmail = ENV.ADMIN_EMAIL;
  const adminPassword = ENV.ADMIN_PASSWORD;

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (adminExists) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, ENV.BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    }
  });

  console.log(`[bootstrap] Usuário admin criado automaticamente (${adminEmail}).`);
};
