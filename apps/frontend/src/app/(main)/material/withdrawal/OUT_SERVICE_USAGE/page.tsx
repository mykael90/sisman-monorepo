import { MaterialWithdrawalServiceUsage } from './components/material-withdrawal-service-usage';
import { showMaintenanceRequestByProtocol } from '../../../maintenance/request/request-actions';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';
import { getUsers } from '../../../user/user-actions';
import { getMaterialGlobalCatalogs } from '../../global-catalog/material-global-catalog-actions';
import { FilePlus } from 'lucide-react';
import { addWithdrawal } from '../withdrawal-actions';

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

  const response = await getMaintenanceRequest('4506/2025');
  console.log(response);
  // const pathname = usePathname();
  // const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialWithdrawalServiceUsage
          promiseMaintenanceRequest={getMaintenanceRequest}
          relatedData={{
            listGlobalMaterials,
            listUsers
          }}
          // SubmitButtonIcon={FilePlus}
          // submitButtonText='Criar Usuário'
          formActionProp={addWithdrawal}
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
