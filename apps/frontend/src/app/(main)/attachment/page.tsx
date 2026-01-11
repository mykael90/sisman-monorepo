import { getAttachments } from './attachment-actions';
import { AttachmentListPage } from './_components/list/attachment-list';

export default async function AttachmentsPage() {
  const attachments = await getAttachments();

  return <AttachmentListPage initialAttachments={attachments} />;
}
