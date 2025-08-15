import Modal from '@/components/ui/modal';
import WarehouseInstanceEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Modal>
      <WarehouseInstanceEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
