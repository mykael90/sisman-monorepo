import Modal from '../../../../../../components/ui/modal';
import { getSismanAccessToken } from '../../../../../../lib/auth/get-access-token';
import RoleEdit from '../../../_components/edit/role-edit'; // Caminho para o componente de edição
import { showRole } from '../../../role-actions'; // Ação para buscar o papel
import Logger from '../../../../../../lib/logger';

const logger = new Logger('role/@modal/(.)edit/[id]/page.tsx');

export default async function Page({
  params
}: {
  params: { id: string }; // O ID virá como string da URL
}) {
  const roleId = parseInt(params.id, 10);

  if (isNaN(roleId)) {
    logger.error(`ID de papel inválido para modal: ${params.id}`);
    // Em um modal, talvez seja melhor não renderizar nada ou um erro simples
    return null;
  }

  const accessTokenSisman = await getSismanAccessToken();
  const initialRole = await showRole(accessTokenSisman, roleId);

  logger.info(`Modal de edição para o papel ID: ${roleId} carregado.`);

  return (
    <Modal>
      <RoleEdit initialRole={initialRole} />
    </Modal>
  );
}
