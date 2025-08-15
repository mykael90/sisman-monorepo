import Modal from '@/components/ui/modal';
import MaintenanceAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <MaintenanceAddPage isInDialog={true} />
    </Modal>
  );
}
