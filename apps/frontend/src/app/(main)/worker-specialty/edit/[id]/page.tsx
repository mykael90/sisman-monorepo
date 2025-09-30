import WorkerSpecialtyEdit from '../../_components/edit/worker-specialty-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showWorkerSpecialty } from '../../worker-specialty-actions';

export default async function Page({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: number }>;
  isInDialog?: boolean;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  const initialWorkerSpecialty = await showWorkerSpecialty(
    id,
    accessTokenSisman
  );

  return (
    <WorkerSpecialtyEdit
      initialWorkerSpecialty={initialWorkerSpecialty}
      isInDialog={isInDialog}
    />
  );
}