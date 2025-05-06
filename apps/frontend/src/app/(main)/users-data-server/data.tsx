import { getUsers } from './_actions';
import { DisplayData } from './display-data';
 
export async function Data() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const data = await getUsers();
  return (
<DisplayData data={data} />
  );
}


