import RoleEdit from '../../_components/edit/role-edit';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';
import { showRole } from '../../role-actions';

export default async function Page({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: number }>;
  isInDialog?: boolean;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  // Fetch the specific role data
  const initialRole = await showRole(accessTokenSisman, id);

  // No extra data like possibleRoles needed for Role edit based on current types

  return <RoleEdit initialRole={initialRole} isInDialog={isInDialog} />;
}
