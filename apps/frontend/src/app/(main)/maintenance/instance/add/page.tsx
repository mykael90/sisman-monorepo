import MaintenanceInstanceAdd from '../_components/add/maintenance-instance-add';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  return <MaintenanceInstanceAdd isInDialog={isInDialog} />;
}
