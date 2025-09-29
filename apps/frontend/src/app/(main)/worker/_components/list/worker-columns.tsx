import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IWorkerWithRelations } from '../../worker-types'; // Alterado para IWorkerWithRelations
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { StatusBadge } from '@/components/ui/status-badge'; // Importar StatusBadge
import { calculateAge, formatAndMaskCPF } from '../../../../../lib/utils';

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<IWorkerWithRelations>(); // Alterado para IWorkerWithRelations

// Define the actions type more specifically if possible, or keep as is
// Using Row<WorkerWithRoles1> is often better than RowData
type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

// createActions será uma função que CRIA o objeto de ações,
// recebendo a função de navegação.
export const createActions = (
  router: AppRouterInstance // Recebe a função de navegação
): ActionHandlers<IWorkerWithRelations> => ({
  // Alterado para IWorkerWithRelations
  onEdit: (row: Row<IWorkerWithRelations>) => {
    // Alterado para IWorkerWithRelations
    console.log('Edit worker', row.original);
    // Certifique-se que row.original.id existe e é o identificador correto.
    // Se seu ID estiver em outra propriedade (ex: _id, workerId), ajuste abaixo.
    if (row.original.id) {
      // Navega para a rota de edição, passando o ID do trabalhador
      // Ajuste o caminho '/admin/workers/edit/' conforme sua estrutura de rotas
      router.push(`worker/edit/${row.original.id}`); // Alterado para 'worker/edit'
    } else {
      console.error('Worker ID is missing, cannot navigate to edit page.');
      // Poderia também navegar para uma página de erro ou mostrar um alerta
      throw new Error('Worker ID is missing, cannot navigate to edit page.');
    }
  },
  onDelete: (row: Row<IWorkerWithRelations>) => {
    // Alterado para IWorkerWithRelations
    console.log('Delete worker', row.original);
    // Implemente sua lógica de deleção aqui (ex: modal de confirmação, chamada de API)
  }
});

export const columns = (
  configuredActions: ActionHandlers<IWorkerWithRelations> // Alterado para IWorkerWithRelations
): ColumnDef<IWorkerWithRelations, any>[] => [
  // Alterado para IWorkerWithRelations
  columnHelper.accessor('name', {
    // Assumindo que Worker tem uma propriedade 'name'
    header: 'Nome',
    cell: (props) => {
      const worker = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (worker.name)
      const loginValue = worker.login; // Assumindo que Worker tem uma propriedade 'login'

      return (
        <div className='flex items-center gap-2 py-0.5'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={worker.image} // Assumindo que Worker tem uma propriedade 'image'
              alt={loginValue ? `${nameValue} (${loginValue})` : nameValue} // Ex: "Nome (Login)"
            />
            <AvatarFallback>
              {getAvatarInitials(loginValue, nameValue)}
            </AvatarFallback>
          </Avatar>
          <span>{nameValue}</span>
        </div>
      );
    }
  }),
  columnHelper.accessor((row) => calculateAge(row.birthdate as any), {
    // Assumindo que Worker tem uma propriedade 'login'
    header: 'Idade',
    size: 50,
    enableResizing: false,
    cell: (props) => <div className='text-center'>{props.getValue()}</div>
  }),
  columnHelper.accessor('cpf', {
    // Assumindo que Worker tem uma propriedade 'login'
    header: 'CPF',
    cell: (props) => {
      const formattedCpf = formatAndMaskCPF(props.getValue());

      return formattedCpf;
    }
  }),
  columnHelper.accessor('birthdate', {
    // Assumindo que Worker tem uma propriedade 'login'
    header: 'Data Nasc.',
    cell: (props) => {
      const date = new Date(props.getValue());
      return date.toLocaleDateString('pt-BR');
    }
  }),
  columnHelper.accessor('email', {
    // Assumindo que Worker tem uma propriedade 'email'
    header: 'Email',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => (row.isActive ? 'Ativo' : 'Inativo'), {
    header: 'Status',
    cell: (props) => <StatusBadge status={`${props.getValue()}`} />, // Usa o componente StatusBadge
    meta: {
      filterVariant: 'select'
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      // Mantém a estrutura original da célula Actions com botões
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    )
  })
];

// Funções auxiliares (manter como estão, pois são genéricas)
function getAvatarInitials(
  login: string | undefined,
  name: string | undefined
): string {
  if (login) {
    const initialsFromLogin = login
      .split('.')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    if (initialsFromLogin.length === 1) {
      return initialsFromLogin.charAt(0);
    }

    return initialsFromLogin.charAt(0) + initialsFromLogin.charAt(1);
  } else if (name) {
    const initialsFromName = name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    if (initialsFromName.length === 1) {
      return initialsFromName.charAt(0);
    }

    return (
      initialsFromName.charAt(0) +
      initialsFromName.charAt(initialsFromName.length - 1)
    );
  } else return 'W'; // Alterado para 'W' de Worker
}
