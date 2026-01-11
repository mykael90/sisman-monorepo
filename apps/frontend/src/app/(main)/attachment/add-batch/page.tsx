import dynamic from 'next/dynamic';
import Loading from '@/components/loading';

const AttachmentAddBatch = dynamic(
  () => import('../_components/add/attachment-add-batch'),
  {
    loading: () => <Loading />
  }
);

export default function AttachmentAddBatchPage() {
  return <AttachmentAddBatch />;
}
