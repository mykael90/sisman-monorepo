import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Supondo que use Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function LicencePage() {
  // 1. Ler o arquivo de licenças de terceiros gerado pelo script
  const thirdPartyPath = path.join(
    process.cwd(),
    'public',
    'THIRD-PARTY-LICENSES.txt'
  );
  let thirdPartyContent = '';

  try {
    thirdPartyContent = fs.readFileSync(thirdPartyPath, 'utf-8');
  } catch (err) {
    thirdPartyContent =
      "Arquivo de licenças não encontrado. Execute 'pnpm generate:licenses' no build.";
  }

  return (
    <main className='container mx-auto flex flex-col gap-6 p-8'>
      {/* Cabeçalho */}
      <div className='space-y-4 text-center md:text-left'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
          Licenciamento e Aspectos Legais
        </h1>
        <p className='text-gray-500 dark:text-gray-400'>
          Informações sobre os termos de uso, distribuição e componentes de
          código aberto do Sisman CMMS.
        </p>
      </div>

      {/* 2. Licença do Projeto (AGPLv3) */}
      <Card>
        <CardHeader>
          <CardTitle>Licença do Projeto (Sisman CMMS)</CardTitle>
          <CardDescription>
            Termos sob os quais este software é distribuído.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-gray-700 dark:text-gray-300'>
          <p>
            O <strong>Sisman CMMS</strong> é um software livre; você pode
            redistribuí-lo e/ou modificá-lo sob os termos da{' '}
            <strong>GNU Affero General Public License (AGPL)</strong> conforme
            publicada pela Free Software Foundation, tanto a versão 3 da
            Licença, ou (a seu critério) qualquer versão posterior.
          </p>
          <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
            <h4 className='mb-2 font-bold text-yellow-800 dark:text-yellow-500'>
              Ausência de Garantia (Isenção de Responsabilidade)
            </h4>
            <p>
              Este programa é distribuído na expectativa de que seja útil,
              porém,
              <strong> SEM NENHUMA GARANTIA</strong>; nem mesmo a garantia
              implícita de COMERCIABILIDADE ou ADEQUAÇÃO A UMA FINALIDADE
              ESPECÍFICA. Consulte a Licença Pública Geral GNU Affero para mais
              detalhes.
            </p>
          </div>
          <div className='flex gap-4 pt-2'>
            <Button asChild variant='outline'>
              <a
                href='https://www.gnu.org/licenses/agpl-3.0.pt-br.html'
                target='_blank'
                rel='noopener noreferrer'
              >
                Ler Licença AGPLv3 Completa
              </a>
            </Button>
            <Button asChild>
              <a
                href='https://github.com/mykael90/sisman-monorepo'
                target='_blank'
                rel='noopener noreferrer'
              >
                Acessar Código Fonte (GitHub)
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Licenças de Terceiros (O arquivo gerado) */}
      <Card>
        <CardHeader>
          <CardTitle>Bibliotecas de Terceiros</CardTitle>
          <CardDescription>
            Este software foi construído com o apoio da comunidade open source.
            Abaixo estão os créditos e licenças das bibliotecas utilizadas
            (NextJS, React, NestJS, Prisma, Tailwind, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[400px] overflow-auto rounded-md border bg-gray-100 p-4 dark:bg-zinc-950'>
            <pre className='font-mono text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400'>
              {thirdPartyContent}
            </pre>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
