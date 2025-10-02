import Modal from '@/components/ui/modal';
import WorkerContractEditPage from '../../../../../worker-contract/[workerId]/edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ workerId: number; id: number }>;
}) {
  return (
    <Modal>
      <div className='sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl'>
        <WorkerContractEditPage params={params} isInDialog={true} />
      </div>
    </Modal>
  );
}
