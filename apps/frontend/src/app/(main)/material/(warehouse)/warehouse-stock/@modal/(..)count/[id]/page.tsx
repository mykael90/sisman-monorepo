import Modal from '@/components/ui/modal';
import MaterialCountPage from '../../../../count/[id]/page';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  return (
    <Modal>
      <MaterialCountPage
        //   params={params}
        isInDialog={true}
      />
    </Modal>
  );
}
