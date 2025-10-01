import Modal from '@/components/ui/modal';
import WorkerContractEditPage from '../../../../../worker-contract/[workerId]/edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ workerId: number; id: number }>;
}) {
  return (
    <Modal>
      <WorkerContractEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
