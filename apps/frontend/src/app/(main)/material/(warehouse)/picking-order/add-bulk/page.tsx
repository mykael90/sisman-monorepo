import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getUsers } from '../../../../user/user-actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../api/auth/_options';
import { getActivesWorkers } from '../../../../worker/worker-actions';
import { MaterialPickingOrderAddBulk } from '../_components/add-bulk/material-picking-order-add-bulk';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accessTokenSisman = await getSismanAccessToken();

  if (!session?.user.idSisman) {
    return <p>Acesso negado. Por favor, faça login.</p>;
  }

  const [listUsers, listWorkers] = await Promise.all([
    getUsers(accessTokenSisman),
    getActivesWorkers(accessTokenSisman)
  ]);

  return (
    <MaterialPickingOrderAddBulk
      relatedData={{
        session,
        listUsers,
        listWorkers
      }}
    />
  );
}
