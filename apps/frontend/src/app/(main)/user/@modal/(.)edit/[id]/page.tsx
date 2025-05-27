import Modal from '../../../../../../components/ui/modal';
import UserEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <UserEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
