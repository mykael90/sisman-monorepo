import UserEdit from '../../_components/edit/user-edit';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';
import { showUser } from '../../user-actions';
import { getRoles } from '../../../role/role-actions';

export default async function Page({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: number }>;
  isInDialog?: boolean;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  const [initialUser, possibleRoles] = await Promise.all([
    showUser(accessTokenSisman, id),
    getRoles(accessTokenSisman)
  ]);

  return (
    <UserEdit
      initialUser={initialUser}
      possibleRoles={possibleRoles}
      isInDialog={isInDialog}
    />
  );
}
