import Modal from '@/components/ui/modal';
import MaintenanceInstanceEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Modal>
      <MaintenanceInstanceEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
