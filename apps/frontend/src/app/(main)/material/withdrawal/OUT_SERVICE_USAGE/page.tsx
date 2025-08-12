import { MaterialWithdrawalForm } from '../components/material-withdrawal-form';
import { showMaintenanceRequest } from '../../../maintenance/request/request-actions';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const requestDataSearch = (protocolNumber: string) =>
    showMaintenanceRequest(accessTokenSisman, protocolNumber);
  // const pathname = usePathname();
  // const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialWithdrawalForm requestDataSearch={showMaintenanceRequest} />

        {/* Sidebar */}
        {/* <div className='space-y-6'>
          <MaterialWithdrawalSummary />
          <RecentWithdrawals />
        </div> */}
      </div>
    </div>
  );
}
