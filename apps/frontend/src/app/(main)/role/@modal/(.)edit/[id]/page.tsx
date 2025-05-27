import Modal from '../../../../../../components/ui/modal';
import RoleEditPage from '../../../edit/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <RoleEditPage params={params} isInDialog={true} />
    </Modal>
  );
}
