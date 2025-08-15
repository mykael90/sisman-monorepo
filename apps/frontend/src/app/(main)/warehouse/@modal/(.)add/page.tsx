import Modal from '@/components/ui/modal';
import WarehouseAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <WarehouseAddPage isInDialog={true} />
    </Modal>
  );
}
