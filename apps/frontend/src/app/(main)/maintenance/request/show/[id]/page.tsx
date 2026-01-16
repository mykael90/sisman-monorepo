import { notFound } from 'next/navigation';
import {
  showMaintenanceRequest,
  showMaintenanceRequestBalanceById
} from '@/app/(main)/maintenance/request/maintenance-request-actions';
import {
  IMaintenanceRequestBalanceWithRelations,
  IMaintenanceRequestShowWithRelations,
  IItemMaintenanceRequestBalance
} from '@/app/(main)/maintenance/request/maintenance-request-types';
import { MaintenanceRequestHeader } from './_components/maintenance-request-header';
import { MaintenanceRequestGeneralInfo } from './_components/maintenance-request-general-info';
import { MaintenanceRequestDemandInfo } from './_components/maintenance-request-demand-info';
import { MaintenanceRequestStatusHistory } from './_components/maintenance-request-status-history';
import { MaintenanceRequestServiceFlow } from './_components/maintenance-request-service-flow';
import { MaintenanceRequestMaterialMovement } from './_components/maintenance-request-material-movement';
import { MaintenanceRequestTimeline } from './_components/maintenance-request-timeline';
import { MaintenanceRequestStats } from './_components/maintenance-request-stats';
import { MaterialBalanceSummaryTable } from '../../../../material/(warehouse)/withdrawal/_components/material-balance-summary-table';
import { MaintenanceRequestMaterialBalance } from './_components/maintenance-request-material-balance';
import { MaintenanceRequestMaterialTabs } from './_components/maitenance-request-tabs-material';

interface MaintenanceRequestShowPageProps {
  params: {
    id: string;
  };
}

export default async function MaintenanceRequestShowPage({
  params
}: MaintenanceRequestShowPageProps) {
  const id = Number(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const maintenanceRequestDataBalance: IMaintenanceRequestBalanceWithRelations | null =
    await showMaintenanceRequestBalanceById(id);

  const maintenanceRequestDataBase: IMaintenanceRequestShowWithRelations | null =
    await showMaintenanceRequest(id);

  if (!maintenanceRequestDataBase) {
    // Check if base data is null first
    notFound();
  }

  const { origin } = maintenanceRequestDataBase;

  const maintenanceRequestDataSipac = origin !== 'SIPAC'? null : await 

  // Merge the two data sources
  const maintenanceRequestData: IMaintenanceRequestShowWithRelations & {
    itemsBalance?: IItemMaintenanceRequestBalance[];
  } = {
    ...(maintenanceRequestDataBase as IMaintenanceRequestShowWithRelations), // Explicitly cast after null check
    // Add itemsBalance from balance data if it exists
    itemsBalance: maintenanceRequestDataBalance?.itemsBalance || []
  };

  return (
    <div className='container mx-auto space-y-6 pb-6'>
      <MaintenanceRequestHeader />
      <MaintenanceRequestGeneralInfo data={maintenanceRequestData} />
      <MaintenanceRequestDemandInfo data={maintenanceRequestData} />
      <MaintenanceRequestStatusHistory data={maintenanceRequestData} />
      <MaintenanceRequestServiceFlow data={maintenanceRequestData} />
      <MaintenanceRequestMaterialBalance data={maintenanceRequestDataBalance} />

      {/* <MaintenanceRequestMaterialMovement data={maintenanceRequestData} /> */}
      <MaintenanceRequestMaterialTabs data={maintenanceRequestData} />
      <MaintenanceRequestTimeline data={maintenanceRequestData} />
      <MaintenanceRequestStats data={maintenanceRequestData} />
    </div>
  );
}
