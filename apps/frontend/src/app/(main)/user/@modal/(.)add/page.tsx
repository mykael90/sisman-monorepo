import Modal from '@/components/ui/modal';
import UserAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <UserAddPage isInDialog={true} />
    </Modal>
  );
}
