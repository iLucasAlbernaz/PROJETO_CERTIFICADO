import { readFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const swaggerFilePath = path.resolve(process.cwd(), 'docs', 'swagger.yaml');
const swaggerFile = readFileSync(swaggerFilePath, 'utf8');

export const swaggerDocument = yaml.parse(swaggerFile);
