import { getUsers } from './_actions';
import { DisplayData } from './display-data';

export async function Data({ children }) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  const data = await getUsers();

  // como passar a prop data para o children abaixo
  return <>{children(data)}</>;
}
