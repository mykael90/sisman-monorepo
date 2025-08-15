// export const dynamic = 'force-dynamic';

import { fetchApiUFRNBuildTime } from '@/lib/fetch/api-ufrn-build-time';

interface sistemaInterface {
  ['id-sistema']: number;
  ['id-categoria-sistema']: number;
  nome: string;
  descricao: string;
  url: string;
}

async function getSistemas(): Promise<sistemaInterface[]> {
  const response = await fetchApiUFRNBuildTime(
    `${process.env.UFRN_API_URL}/site/v1/unidades`,
    {
      // cache: 'no-store'
      // next: { revalidate: 10 }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch todos');

  const data = await response.json();
  return data;
}

export default async function Sistemas() {
  const sistemas = await getSistemas();

  return (
    <section className='flex justify-center'>
      <div className='flex w-md flex-col'>
        <h1 className='flex text-2xl font-bold'>SISTEMAS</h1>
        <ul className='mt-6 flex flex-col gap-3'>
          {sistemas.slice(0, 10).map((sistema) => (
            <li key={sistema['id-sistema']}>{sistema.nome}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
