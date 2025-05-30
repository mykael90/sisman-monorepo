// export const dynamic = 'force-dynamic';

import { fetchApiUFRNBuildTime } from '../../../../lib/fetch/api-ufrn-build-time';

interface ServidorDTO {
  'area-interesse': string; // Área de interesse da pessoa
  categoria: string; // Categoria do servidor
  email: string; // Email da pessoa
  'id-institucional': number; // Identificador institucional do servidor
  lotacao: string; // Unidade de lotação da pessoa
  nome: string; // Nome da pessoa
  siape: number; // Siape do servidor
  'url-foto': string; // URL da foto da pessoa
}

async function getServidores(): Promise<any> {
  const response = await fetchApiUFRNBuildTime(
    `${process.env.UFRN_API_URL}/site/v1/servidores?limit=100`,
    {
      // cache: 'no-store'
      // next: { revalidate: 10 }
      headers: {
        paginado: 'true'
      }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch todos');

  const data = await response.json();
  const headers = await response.headers;
  console.log(headers);
  return { data, headers };
}

export default async function Servidores() {
  const { data: servidores, headers } = await getServidores();

  return (
    <section className='flex justify-center'>
      <div className='flex w-md flex-col'>
        <h1 className='flex text-2xl font-bold'>SERVIDORES</h1>
        Número total de páginas = {JSON.stringify(headers.get('x-pages'))}
        Número total de registros = {JSON.stringify(headers.get('x-total'))}
        <ul className='mt-6 flex flex-col gap-3'>
          {servidores.slice(0, 100).map((servidor) => (
            <li key={servidor['id-institucional']}>{servidor.nome}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
