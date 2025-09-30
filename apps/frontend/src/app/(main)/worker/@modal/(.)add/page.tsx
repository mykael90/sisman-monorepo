import Modal from '@/components/ui/modal';
import WorkerAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <WorkerAddPage isInDialog={true} />
    </Modal>
  );
}
