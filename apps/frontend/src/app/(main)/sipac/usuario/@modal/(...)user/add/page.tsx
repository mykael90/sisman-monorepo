import Modal from '@/components/ui/modal';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getRoles } from '../../../../../role/role-actions';
import UserAdd from '../../../../../user/_components/add/user-add';

export default async function page(props: {
  searchParams: {
    name: string;
    login: string;
    email: string;
  };
}) {
  const { name, login, email } = props.searchParams;
  const preDefaultData = { name, login, email };

  const accessTokenSisman = await getSismanAccessToken();
  const [listRoles] = await Promise.all([getRoles(accessTokenSisman)]);

  return (
    <Modal>
      <UserAdd
        relatedData={listRoles}
        isInDialog={true}
        preDefaultData={preDefaultData}
      />
    </Modal>
  );
}
