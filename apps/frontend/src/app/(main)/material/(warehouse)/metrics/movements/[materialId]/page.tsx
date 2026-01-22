import { notFound } from 'next/navigation';
import { MaterialIdMovementMetricsPage } from './_components/material-id-movement';

export default async function Page({
  params
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;
  if (!materialId) notFound();
  return <MaterialIdMovementMetricsPage materialId={materialId} />;
}
