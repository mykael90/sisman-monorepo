// app/(main)/material/request/[id]/page.tsx
import { notFound } from 'next/navigation';
import {
  showMaterialRequestBalanceByProtocol,
  showRequest
} from '@/app/(main)/material/request/material-request-actions';
import { MaterialRequestHeader } from '../../_components/show/material-request-header';
import { MaterialRequestBalanceTable } from '../../_components/show/material-request-balance';
import { MaterialRequestTabs } from '../../_components/show/material-request-tabs';
import { MaterialRequestGeneralInfo } from '../../_components/show/material-request-general-info';
import { MaterialRequestHistory } from '../../_components/show/material-request-history';
import { MaterialRequestStats } from '../../_components/show/material-request-stats';

interface MaterialRequestShowPageProps {
  params: Promise<{ id: number }>;
}

export default async function MaterialRequestShowPage({
  params
}: MaterialRequestShowPageProps) {
  const { id } = await params;

  if (isNaN(id)) notFound();

  // Data Fetching em paralelo para melhor performance se possível,
  // mas mantendo a lógica sequencial se houver dependência estrita (protocol)
  const requestData = await showRequest(id);

  if (!requestData) notFound();

  const balanceData = await showMaterialRequestBalanceByProtocol(
    requestData.protocolNumber as string
  );

  return (
    <div className='container mx-auto space-y-6 pb-6'>
      <MaterialRequestHeader data={requestData} />

      <MaterialRequestGeneralInfo data={requestData} />

      {balanceData && <MaterialRequestBalanceTable data={balanceData} />}

      <MaterialRequestTabs requestData={requestData} />

      <MaterialRequestHistory history={requestData.statusHistory} />

      <MaterialRequestStats requestData={requestData} />
    </div>
  );
}
