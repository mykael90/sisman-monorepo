import RoleEdit from '../../_components/edit/role-edit';
import { getSismanAccessToken } from '../../../../../lib/auth/get-access-token';
import Logger from '../../../../../lib/logger';
import { showRole } from '../../role-actions';
import { IRoleEdit } from '../../role-types';

const logger = new Logger('role/edit/[id]/page.tsx');

export default async function Page({
  params
}: {
  // params é um objeto, não uma Promise aqui.
  params: { id: string }; // O ID virá como string da URL
}) {
  const roleId = parseInt(params.id, 10); // Converter para número

  if (isNaN(roleId)) {
    // Lidar com ID inválido, talvez redirecionar ou mostrar erro
    logger.error(`ID de papel inválido recebido: ${params.id}`);
    // Pode-se lançar um notFound() ou redirecionar
    return <div>ID do Papel inválido.</div>;
  }

  const accessTokenSisman = await getSismanAccessToken();
  const initialRole = await showRole(accessTokenSisman, roleId);

  logger.info(`Página de edição para o papel ID: ${roleId} carregada.`);

  return <RoleEdit initialRole={initialRole} />;
}
