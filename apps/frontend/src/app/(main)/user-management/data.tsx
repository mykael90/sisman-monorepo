import { UserManagementPage } from '../../../components/user-management/user-management-page';
import { getUsers } from './_actions';
import { DisplayData } from './display-data';

export async function Data({ children }) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  const data = await getUsers();
  return <UserManagementPage initialData={data} />;
}
