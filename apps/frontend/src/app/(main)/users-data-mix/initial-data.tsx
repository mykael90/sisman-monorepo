import { getUsers } from "./_actions";

export default async function initialData() {
    const data = await getUsers();
    return data;
}
