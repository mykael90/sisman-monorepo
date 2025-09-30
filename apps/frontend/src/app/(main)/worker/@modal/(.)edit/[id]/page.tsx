import Modal from '@/components/ui/modal';
import WorkerEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <WorkerEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
