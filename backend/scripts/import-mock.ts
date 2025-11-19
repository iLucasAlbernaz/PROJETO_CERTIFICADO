import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { normalizeCPF } from '../src/utils/cpf';

config();

const prisma = new PrismaClient();

type LegacyCertificate = {
  cpf: string;
  registro: string;
  matricula: string;
  nome: string;
  curso: string;
  inicio: string;
  fim: string;
};

const parseDate = (value: string) => {
  const [day, month, year] = value.split('/').map((segment) => Number(segment));
  if (!day || !month || !year) {
    throw new Error(`Data inválida: ${value}`);
  }
  return new Date(Date.UTC(year, month - 1, day));
};

async function extractMockData(): Promise<LegacyCertificate[]> {
  const htmlPath = path.resolve(__dirname, '..', 'legacy-mock.html');
  const html = readFileSync(htmlPath, 'utf8');
  const match = html.match(/const\s+mockData\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error('Bloco mockData não encontrado no index.html');
  }

  const script = new vm.Script(`(${match[1]})`);
  return script.runInNewContext({});
}

async function main() {
  const legacyData = await extractMockData();

  const payload = legacyData.map((item) => ({
    cpf: normalizeCPF(item.cpf),
    registro: item.registro,
    matricula: item.matricula,
    nome: item.nome,
    curso: item.curso,
    inicio: parseDate(item.inicio),
    fim: parseDate(item.fim)
  }));

  await prisma.certificate.createMany({
    data: payload,
    skipDuplicates: true
  });

  console.log(`Importados ${payload.length} certificados para o banco`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
