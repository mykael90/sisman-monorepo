import * as checker from 'license-checker-rseidelsohn';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração para ESM (substitui o __dirname antigo) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuração dos Caminhos ---
const PROJECT_ROOT = path.resolve(__dirname, '../'); // Sobe um nível para a raiz
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'apps/frontend/public/THIRD-PARTY-LICENSES.txt');

// Caminhos dos apps que queremos escanear
const APP_PATHS = [
  path.join(PROJECT_ROOT, 'apps/frontend'),
  path.join(PROJECT_ROOT, 'apps/backend'),
  path.join(PROJECT_ROOT, 'apps/scraping-api')
];

/**
 * Função Wrapper para o license-checker retornar Promessa
 */
function checkLicenses(startPath) {
  return new Promise((resolve, reject) => {
    checker.init({
      start: startPath,
      production: true,        // Apenas dependências de produção
      excludePrivatePackages: true, // Ignora pacotes internos do workspace
      // direct: true,         // Opcional: Descomente se quiser apenas dependências diretas (não recursivas)
    }, (err, packages) => {
      if (err) {
        // As vezes ele falha se não tiver node_modules, tratamos isso
        console.warn(`⚠️  Aviso em ${startPath}: ${err.message}`);
        resolve({}); 
      } else {
        resolve(packages);
      }
    });
  });
}

/**
 * Formata o objeto de licenças para texto legível
 */
function formatLicenseText(pkgName, data) {
  // Tenta pegar o texto da licença do arquivo, ou usa o tipo se não achar
  let licenseContent = '(License text not found)';
  
  if (data.licenseFile) {
    try {
      licenseContent = fs.readFileSync(data.licenseFile, 'utf-8');
    } catch (e) {
      console.warn(`⚠️  Não foi possível ler o arquivo de licença para ${pkgName}`);
    }
  }

  const publisher = data.publisher ? `Publisher: ${data.publisher}\n` : '';
  const repo = data.repository ? `Repository: ${data.repository}\n` : '';
  const licenseType = data.licenses ? `License Type: ${data.licenses}\n` : '';

  return `
=========================================================================
PACKAGE: ${pkgName}
${publisher}${repo}${licenseType}=========================================================================
${licenseContent}

`;
}

async function main() {
  console.log('🔍 Iniciando varredura de licenças no Monorepo (Modo ESM)...');
  
  let allPackages = {};

  for (const appPath of APP_PATHS) {
    if (fs.existsSync(appPath)) {
      console.log(`📦 Lendo dependências de: ${path.basename(appPath)}...`);
      try {
        const packages = await checkLicenses(appPath);
        // Merge dos pacotes
        allPackages = { ...allPackages, ...packages };
      } catch (error) {
        console.error(`❌ Erro crítico ao ler ${appPath}:`, error);
      }
    } else {
      console.warn(`⚠️  Caminho não encontrado: ${appPath}`);
    }
  }

  const uniqueCount = Object.keys(allPackages).length;
  console.log(`📝 Formatando ${uniqueCount} licenças únicas...`);

  let finalContent = "LICENÇAS DE TERCEIROS (THIRD PARTY NOTICES)\n";
  finalContent += "Este software utiliza os seguintes componentes open-source:\n";
  finalContent += "---------------------------------------------------------\n\n";

  for (const [pkgName, data] of Object.entries(allPackages)) {
    finalContent += formatLicenseText(pkgName, data);
  }

  // Garantir que o diretório de destino existe
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, finalContent);
  console.log(`✅ Sucesso! Arquivo gerado em:\n   ${OUTPUT_PATH}`);
}

main();