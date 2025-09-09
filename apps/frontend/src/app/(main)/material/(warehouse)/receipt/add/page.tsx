import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getUsers } from '../../../../user/user-actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../api/auth/_options';
import { getWorkers } from '../../../../worker/worker-actions';
import { MaterialReceiptAdd } from '../_components/add/receipt-add';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user.idSisman) {
    return <p>Acesso negado. Por favor, faça login.</p>;
  }

  return (
    <MaterialReceiptAdd
      relatedData={{
        session
      }}
    />
  );
}
