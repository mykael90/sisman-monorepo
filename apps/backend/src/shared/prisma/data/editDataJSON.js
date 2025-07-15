import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const logger = console;

// Replicate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = './infrastructure-space-types.json';

const fullPath = path.resolve(__dirname, jsonFilePath);

const rawData = fs.readFileSync(fullPath, 'utf-8');
const rawDataArray = JSON.parse(rawData);

//remove the key id
rawDataArray.forEach((item) => {
  delete item.id;
});

// Usando o método nativo `sort` com `localeCompare` para ordenação correta de acentos.
// `...rawDataArray` cria uma cópia para não modificar o array original, imitando o comportamento do `sortBy`.
const proccessedData = [...rawDataArray].sort((a, b) =>
  a.name.localeCompare(b.name, 'pt-BR')
);

const outputFilePath = path.resolve(
  __dirname,
  'infrastructure-space-types2.json'
);

fs.writeFileSync(
  outputFilePath,
  JSON.stringify(proccessedData, null, 2),
  'utf-8'
);

logger.log('Done!');
