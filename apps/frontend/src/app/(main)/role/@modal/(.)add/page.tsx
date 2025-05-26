import Modal from '../../../../../components/ui/modal';
import RoleAdd from '../../_components/add/role-add'; // Caminho para o componente de adição
import Logger from '../../../../../lib/logger';

const logger = new Logger('role/@modal/(.)add/page.tsx');

export default function Page() {
  logger.info(`Modal de adição de papel carregado.`);
  return (
    <Modal>
      <RoleAdd />
    </Modal>
  );
}
