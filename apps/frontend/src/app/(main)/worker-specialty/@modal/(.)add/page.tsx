import Modal from '@/components/ui/modal';
import WorkerSpecialtyAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <WorkerSpecialtyAddPage isInDialog={true} />
    </Modal>
  );
}
