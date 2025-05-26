import RoleAdd from '../_components/add/role-add';
import Logger from '../../../../lib/logger';

const logger = new Logger('role/add/page.tsx');

export default async function Page() {
  logger.info(`Página de adição de papel carregada.`);

  return <RoleAdd />;
}
