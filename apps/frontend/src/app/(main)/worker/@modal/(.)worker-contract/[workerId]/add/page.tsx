import Modal from '@/components/ui/modal';
import WorkerContractAddPage from '../../../../worker-contract/[workerId]/add/page';

export default async function Page({
  params
}: {
  params: Promise<{ workerId: number }>;
}) {
  return (
    <Modal>
      <div className='max-w-3xl'>
        <WorkerContractAddPage params={params} isInDialog={true} />
      </div>
    </Modal>
  );
}
