import Modal from '@/components/ui/modal';
import WorkerSpecialtyEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <WorkerSpecialtyEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
