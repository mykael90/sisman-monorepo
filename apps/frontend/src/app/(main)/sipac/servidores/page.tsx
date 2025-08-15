import { getUfrnAccessToken } from '@/lib/auth/get-access-token';
import { ServidoresListPage } from './_components/list/servidores-list';
import { getServidores } from './servidores-actions';

export default async function Servidores() {
  const accessTokenUFRN = await getUfrnAccessToken();

  // const currentDataPromise = getServidores(accessTokenUFRN);
  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <ServidoresListPage
      // dataPromise={currentDataPromise} // Passa a promise criada acima
      // refreshAction={getRefreshedUsers} // Passa a referência da função Server Action
      key={listKey} // Passa a string gerada como chave
    />
  );
}
