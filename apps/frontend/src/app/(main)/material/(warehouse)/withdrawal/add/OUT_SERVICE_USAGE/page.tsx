import { MaterialWithdrawalFormAdd } from '../../_components/form/material-withdrawal-form-add';
import { showMaintenanceRequestByProtocol } from '../../../../../maintenance/request/maintenance-request-actions';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getUsers } from '../../../../../user/user-actions';
import { getMaterialGlobalCatalogs } from '../../../../global-catalog/material-global-catalog-actions';
import { FilePlus } from 'lucide-react';
import { addWithdrawal } from '../../withdrawal-actions';
import { CardMaintenanceSummary } from '../../_components/card-maintenance-summary';
import { Card } from '../../../../../../../components/ui/card';
import { CardMaterialRequestLinkDetails } from '../../_components/card-material-link-details';
import { RequestMaintenanceMaterialForm } from '../../_components/form/request-maintenance-material-form';
import { WithdrawalDetailUsageService } from './components/withdrawal-details-usage-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../api/auth/_options';
import { IMaterialWithdrawalAddForm } from '../../withdrawal-types';
import { materialOperationOutDisplayMap } from '../../../../../../../mappers/material-operations-mappers';
import { getWorkers } from '../../../../../worker/worker-actions';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accessTokenSisman = await getSismanAccessToken();

  if (!session?.user.idSisman) {
    return <p>Acesso negado. Por favor, faça login.</p>;
  }

  const defaultDataWithdrawalForm: Partial<
    Record<keyof IMaterialWithdrawalAddForm, any>
  > = {
    withdrawalDate: new Date(),
    maintenanceRequestId: undefined,
    materialRequestId: undefined,
    materialPickingOrderId: undefined,
    processedByUserId: Number(session.user.idSisman),
    collectedByWorkerId: '',
    collectedByUserId: '',
    collectedByOther: null,
    movementTypeCode: materialOperationOutDisplayMap.OUT_SERVICE_USAGE,
    items: [],
    notes: undefined,
    collectorType: 'worker',
    legacy_place: undefined
  };

  // const requestDataSearch = (protocolNumber: string) => ({
  //   getMaintenanceRequest: showMaintenanceRequestByProtocol(
  //     accessTokenSisman,
  //     protocolNumber
  //   )
  // });

  // async function getMaintenanceRequest(protocolNumber: string) {
  //   'use server';
  //   return showMaintenanceRequestByProtocol(accessTokenSisman, protocolNumber);
  // }

  const [listUsers, listWorkers] = await Promise.all([
    getUsers(accessTokenSisman),
    getWorkers(accessTokenSisman)
  ]);

  // const response = await getMaintenanceRequest('4506/2025');
  // console.log(response);
  // const pathname = usePathname();
  // const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* Main Form */}
      <MaterialWithdrawalFormAdd
        // promiseMaintenanceRequest={getMaintenanceRequest}
        relatedData={{
          listUsers,
          listWorkers
        }}
        // SubmitButtonIcon={FilePlus}
        // submitButtonText='Criar Usuário'
        defaultData={defaultDataWithdrawalForm}
        formActionProp={addWithdrawal}
        CardMaintenanceSummary={CardMaintenanceSummary}
        CardMaterialLinkDetails={CardMaterialRequestLinkDetails}
        RequestMaintenanceMaterialForm={RequestMaintenanceMaterialForm}
        WithdrawalDetailsForm={WithdrawalDetailUsageService}
        // withdrawalType={withdrawalType}
      />

      {/* Sidebar */}
      {/* <div className='space-y-6'>
          <MaterialWithdrawalSummary />
          <RecentWithdrawals />
        </div> */}
    </div>
  );
}
