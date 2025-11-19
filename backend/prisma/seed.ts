import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@certificados.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash, role: 'ADMIN' },
    update: { passwordHash }
  });

  console.log(`Administrador padrão disponível em ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
