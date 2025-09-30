import WorkerSpecialtyAdd from '../_components/add/worker-specialty-add';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  return <WorkerSpecialtyAdd isInDialog={isInDialog} />;
}