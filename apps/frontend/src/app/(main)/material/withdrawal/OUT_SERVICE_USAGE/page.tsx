import { MaterialWithdrawalFormAdd } from '../components/form/material-withdrawal-form-add';
import { showMaintenanceRequestByProtocol } from '../../../maintenance/request/request-actions';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';
import { getUsers } from '../../../user/user-actions';
import { getMaterialGlobalCatalogs } from '../../global-catalog/material-global-catalog-actions';
import { FilePlus } from 'lucide-react';
import { addWithdrawal } from '../withdrawal-actions';
import { CardMaintenanceSummary } from '../components/card-maintenance-summary';
import { Card } from '../../../../../components/ui/card';
import { CardMaterialLinkDetails } from '../components/card-material-link-details';
import { RequestMaintenanceMaterialForm } from '../components/request-maintenance-material-form';
import { WithdrawalDetailUsageService } from './components/withdrawal-details-usage-service';

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // const requestDataSearch = (protocolNumber: string) => ({
  //   getMaintenanceRequest: showMaintenanceRequestByProtocol(
  //     accessTokenSisman,
  //     protocolNumber
  //   )
  // });

  async function getMaintenanceRequest(protocolNumber: string) {
    'use server';
    return showMaintenanceRequestByProtocol(accessTokenSisman, protocolNumber);
  }

  const [listGlobalMaterials, listUsers] = await Promise.all([
    getMaterialGlobalCatalogs(accessTokenSisman, { warehouseId: 1 }),
    getUsers(accessTokenSisman)
  ]);

  // const response = await getMaintenanceRequest('4506/2025');
  // console.log(response);
  // const pathname = usePathname();
  // const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialWithdrawalFormAdd
          promiseMaintenanceRequest={getMaintenanceRequest}
          relatedData={{
            listGlobalMaterials,
            listUsers
          }}
          // SubmitButtonIcon={FilePlus}
          // submitButtonText='Criar Usuário'
          formActionProp={addWithdrawal}
          CardMaintenanceSummary={CardMaintenanceSummary}
          CardMaterialLinkDetails={CardMaterialLinkDetails}
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
    </div>
  );
}
