import Modal from '../../../../../../components/ui/modal';
import { getSismanAccessToken } from '../../../../../../lib/auth/get-access-token';
import UserEdit from '../../../_components/edit/user-edit';
import { showUser } from '../../../user-actions';

export default async function Page({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  // const accessTokenSisman =  123456
  // Chame showUser() UMA VEZ para esta renderização do Server Component.
  // Esta promise será passada para frente. Não espere a resolução da promessa.
  // const currentDataPromise = showUser(accessTokenSisman, id);

  const [initialUser] = await Promise.all([showUser(accessTokenSisman, id)]);

  console.log(initialUser);

  // Gere uma chave única para esta renderização.
  // Pode ser um timestamp, um ID aleatório, ou algo que mude quando
  // você considerar que os dados são "novos".
  // Se getUsers() aceitasse um parâmetro (ex: ID de usuário, página),
  // esse parâmetro seria um candidato ideal para a chave.
  // Como não parece ser o caso aqui, um timestamp ou string aleatória
  // garantirá que, se a Page re-renderizar (ex: após refreshAction),
  // a key será nova, forçando DisplayData a resetar.
  // const keyForDisplayData = Date.now().toString() + Math.random().toString();
  // Ou simplesmente: const keyForDisplayData = Math.random().toString();
  // Ou, se você tiver um ID da sessão de dados: const keyForDisplayData = someDataSessionId;
  // Fazia mais sentido ainda ser a query que foi enviada para realizar alguma filtragem no fetch

  // logger.info(
  //   `Page RSC render: dataPromise created. Key for DisplayData: ${keyForDisplayData}`
  // );

  return (
    <Modal>
      <UserEdit
        initialUser={initialUser} // Passa a promise criada acima
        // refreshAction={getRefreshedUsers} // Passa a referência da função Server Action
        // key={keyForDisplayData} // Passa a string gerada como chave
      />
    </Modal>
  );
}
