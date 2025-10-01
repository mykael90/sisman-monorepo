import Modal from '@/components/ui/modal';
import WorkerContractAddPage from '../../../../worker-contract/[workerId]/add/page';

export default async function Page({
  params
}: {
  params: Promise<{ workerId: number }>;
}) {
  return (
    <Modal>
      <WorkerContractAddPage params={params} isInDialog={true} />
    </Modal>
  );
}
