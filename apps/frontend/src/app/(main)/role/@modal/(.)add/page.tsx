import Modal from '../../../../../components/ui/modal';
import RoleAddPage from '../../add/page';

export default function page() {
  return (
    <Modal>
      <RoleAddPage isInDialog={true} />
    </Modal>
  );
}
