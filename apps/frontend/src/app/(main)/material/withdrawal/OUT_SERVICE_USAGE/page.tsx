import { MaterialWithdrawalForm } from '../components/material-withdrawal-form';
import { showMaintenanceRequestByProtocol } from '../../../maintenance/request/request-actions';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';

export default async function Page() {
  // const accessTokenSisman = await getSismanAccessToken();

  // const requestDataSearch = (protocolNumber: string) => ({
  //   getMaintenanceRequest: showMaintenanceRequestByProtocol(
  //     accessTokenSisman,
  //     protocolNumber
  //   )
  // });

  async function getMaintenanceRequest(protocolNumber: string) {
    'use server';
    const accessTokenSisman = await getSismanAccessToken();
    return showMaintenanceRequestByProtocol(accessTokenSisman, protocolNumber);
  }

  const response = await getMaintenanceRequest('4506/2025');
  console.log(response);
  // const pathname = usePathname();
  // const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialWithdrawalForm
          promiseMaintenanceRequest={getMaintenanceRequest}
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
