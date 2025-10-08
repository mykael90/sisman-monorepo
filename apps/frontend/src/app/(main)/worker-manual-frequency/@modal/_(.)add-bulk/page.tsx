import Modal from '@/components/ui/modal';
import WorkerManualFrequencyAddBulkPage from '../../add-bulk/page';

export default function page() {
  return (
    <Modal>
      <WorkerManualFrequencyAddBulkPage isInDialog={true} />
    </Modal>
  );
}
