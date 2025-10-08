import Modal from '@/components/ui/modal';
import WorkerManualFrequencyEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <WorkerManualFrequencyEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
