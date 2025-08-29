import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getUsers } from '../../../../user/user-actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../api/auth/_options';
import { getWorkers } from '../../../../worker/worker-actions';
import { MaterialWithdrawalAdd } from '../_components/add/withdrawal-add';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accessTokenSisman = await getSismanAccessToken();

  if (!session?.user.idSisman) {
    return <p>Acesso negado. Por favor, faça login.</p>;
  }

  const [listUsers, listWorkers] = await Promise.all([
    getUsers(accessTokenSisman),
    getWorkers(accessTokenSisman)
  ]);

  return (
    <MaterialWithdrawalAdd
      relatedData={{
        session,
        listUsers,
        listWorkers
      }}
    />
  );
}
