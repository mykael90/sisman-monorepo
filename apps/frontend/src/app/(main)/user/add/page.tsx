import UserAdd from '../_components/add/user-add';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import Logger from '../../../../lib/logger';
import { getRoles } from '../../role/role-actions';

const logger = new Logger('user/add/page.tsx');

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [possibleRoles] = await Promise.all([getRoles(accessTokenSisman)]);

  return <UserAdd possibleRoles={possibleRoles} isInDialog={isInDialog} />;
}
