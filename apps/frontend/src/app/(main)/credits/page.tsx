import fs from 'fs';
import path from 'path';

export default function CreditsPage() {
  // Ler o arquivo no servidor (Server Component)
  const licensePath = path.join(
    process.cwd(),
    'public',
    'THIRD-PARTY-LICENSES.txt'
  );
  let licenseContent = '';

  try {
    licenseContent = fs.readFileSync(licensePath, 'utf-8');
  } catch (err) {
    licenseContent =
      "Arquivo de licenças não encontrado. Execute 'pnpm generate:licenses'.";
  }

  return (
    <div className='prose dark:prose-invert container mx-auto p-8'>
      <h1>Créditos e Licenças de Terceiros</h1>
      <p>
        Este software utiliza várias bibliotecas de código aberto. Abaixo estão
        listados os avisos legais exigidos por cada uma delas.
      </p>

      <div className='h-[600px] overflow-auto rounded-md border bg-gray-100 p-4 dark:bg-gray-900'>
        <pre className='font-mono text-xs whitespace-pre-wrap'>
          {licenseContent}
        </pre>
      </div>
    </div>
  );
}
