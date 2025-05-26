import { Suspense } from 'react';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import Logger from '../../../lib/logger';
import Loading from '../../../components/loading'; // Componente de loading genérico

import { getRoles, getRefreshedRoles } from './role-actions';
import { RoleListPage } from './_components/list/role-list';

const logger = new Logger('role-management-page');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // Busca inicial dos papéis
  // Envolver em Promise.all se houver múltiplas chamadas de dados iniciais
  const [initialRoles] = await Promise.all([getRoles(accessTokenSisman)]);

  logger.info(
    `Role Page RSC render: ${initialRoles.length} initial roles fetched.`
  );

  // Chave para forçar o re-render do componente cliente se necessário,
  // por exemplo, após uma ação que invalide os dados de forma complexa.
  // Para revalidação simples via server actions, revalidatePath/revalidateTag é geralmente suficiente.
  const keyForRoleListPage = Date.now().toString() + Math.random().toString();

  return (
    <Suspense fallback={<Loading />}>
      <RoleListPage
        initialRoles={initialRoles}
        refreshAction={getRefreshedRoles} // Passa a server action para revalidar os dados
        key={keyForRoleListPage}
      />
    </Suspense>
  );
}
