import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getRefreshedRoles, getRoles } from './role-actions';
import Logger from '@/lib/logger';
import { RoleListPage } from './_components/list/role-list';

const logger = new Logger('roles-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // Fetch the initial list of roles
  const [initialRoles] = await Promise.all([getRoles(accessTokenSisman)]);

  // Generate a unique key for this render to force component reset on revalidation
  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <RoleListPage
      initialRoles={initialRoles}
      refreshAction={getRefreshedRoles}
      key={listKey}
    />
  );
}
