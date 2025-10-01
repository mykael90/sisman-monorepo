import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  EllipsisVertical
} from 'lucide-react';
import { IWorkerWithRelations } from '../../worker-types'; // Alterado para IWorkerWithRelations
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { StatusBadge } from '@/components/ui/status-badge'; // Importar StatusBadge
import {
  calculateAge,
  formatAndMaskCPF,
  formatOnlyDateToUTC
} from '../../../../../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../components/ui/popover';
import { toast } from 'sonner';

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<IWorkerWithRelations>(); // Alterado para IWorkerWithRelations

export const defaultColumn: Partial<ColumnDef<IWorkerWithRelations>> = {
  // Largura padrão
  size: 100,
  enableResizing: false,
  // Filtro desligado por padrão
  enableColumnFilter: false,
  filterFn: 'arrIncludesSome',
  // Renderizador padrão da célula (texto simples)
  cell: ({ getValue }) => {
    const value = getValue();
    if (value === null || value === undefined || value === '') {
      return <span className='text-muted-foreground'>N/A</span>;
    }
    return <div className='whitespace-normal'>{String(value)}</div>;
  }
};

// Define the actions type more specifically if possible, or keep as is
// Using Row<WorkerWithRoles1> is often better than RowData
type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

type ActionHandlersSubrows = {
  [key: string]: (
    contract: IWorkerWithRelations['workerContracts'][number]
  ) => void;
};

// createActions será uma função que CRIA o objeto de ações para subrows,
// recebendo a função de navegação.
export const createActionsSubrows = (
  router: AppRouterInstance // Recebe a função de navegação
): ActionHandlersSubrows => ({
  onEditContract: (
    contract: IWorkerWithRelations['workerContracts'][number]
  ) => {
    console.log('Edit contract for worker-contract', contract);
    // Certifique-se que contract.id existe e é o identificador correto.
    if (contract.id) {
      // Navega para a rota de edição, passando o ID do contrato
      router.push(`worker-contract/${contract.workerId}/edit/${contract.id}`);
    } else {
      console.error('Contract ID is missing, cannot navigate to edit page.');
      throw new Error('Contract ID is missing, cannot navigate to edit page.');
    }
  }
});
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
  },
  onAddContract: (row: Row<IWorkerWithRelations>) => {
    // Alterado para IWorkerWithRelations
    console.log('Add contract for worker', row.original);

    //verificar se tem algum contrato aberto antes de iniciar um novo contrato
    const workerContracts = row.original.workerContracts || [];

    const openedContracts = workerContracts.filter(
      (contract) => !contract.endDate
    );

    if (openedContracts.length > 0) {
      console.log(
        'Attempting to show toast error: "É necessário encerrar todos os contratos ativos para cadastrar um novo contrato."'
      );
      toast.error(
        `É necessário encerrar todos os contratos ativos de ${row.original.name} para cadastrar um novo contrato.`
      );

      return;
    }

    if (row.original.id) {
      // Navega para a rota de edição, passando o ID do trabalhador
      // Ajuste o caminho '/admin/workers/edit/' conforme sua estrutura de rotas
      router.push(`worker-contract/${row.original.id}/add`); // Alterado para 'worker/edit'
    } else {
      console.error('Worker ID is missing, cannot navigate to add page.');
      // Poderia também navegar para uma página de erro ou mostrar um alerta
      throw new Error('Worker ID is missing, cannot navigate to add page.');
    }
  }
});

export const columns = (
  configuredActions: ActionHandlers<IWorkerWithRelations> // Alterado para IWorkerWithRelations
): ColumnDef<IWorkerWithRelations, any>[] => [
  columnHelper.display({
    id: 'expander',
    size: 20,
    header: ({ table }) => (
      <Button
        variant='ghost'
        size='icon'
        onClick={table.getToggleAllRowsExpandedHandler()}
      >
        {table.getIsAllRowsExpanded() ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
    ),
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
    )
  }),
  columnHelper.accessor('name', {
    // Assumindo que Worker tem uma propriedade 'name'
    header: 'Nome',
    size: 320,
    enableResizing: false,
    cell: (props) => {
      const worker = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (worker.name)
      // const loginValue = worker.login; // Assumindo que Worker tem uma propriedade 'login'

      return (
        <div className='flex items-center gap-2 py-0.5'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback>
              {getAvatarInitials(undefined, nameValue)}
            </AvatarFallback>
          </Avatar>
          <span className='whitespace-normal'>{nameValue}</span>
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
    size: 100,
    enableResizing: false,
    cell: (props) => {
      const formattedCpf = formatAndMaskCPF(props.getValue());

      return formattedCpf;
    }
  }),
  columnHelper.accessor('birthdate', {
    // Assumindo que Worker tem uma propriedade 'login'
    header: 'Data Nasc.',
    size: 100,
    enableResizing: false,
    cell: (props) => {
      return formatOnlyDateToUTC(props.getValue());
    }
  }),
  columnHelper.accessor('email', {
    // Assumindo que Worker tem uma propriedade 'email'
    header: 'Email',
    size: 200,
    enableResizing: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('phone', {
    // Assumindo que Worker tem uma propriedade 'email'
    header: 'Telefone',
    size: 100,
    enableResizing: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => (row.isActive ? 'Ativo' : 'Inativo'), {
    header: 'Status',
    size: 100,
    enableResizing: false,
    enableColumnFilter: true,
    cell: (props) => <StatusBadge status={`${props.getValue()}`} />, // Usa o componente StatusBadge
    meta: {
      filterVariant: 'select'
    }
  }),
  columnHelper.accessor((row) => row.maintenanceInstance?.name, {
    header: 'Instância',
    size: 100,
    enableColumnFilter: true,
    enableResizing: false,
    cell: (props) => <Badge variant='outline'>{props.getValue()}</Badge> // Usa o componente StatusBadge
  }),
  columnHelper.display({
    id: 'actions',
    size: 100,
    enableResizing: false,
    header: 'Ações',
    cell: ({ row }) => (
      // Mantém a estrutura original da célula Actions com botões
      <div className='flex gap-2'>
        <Button
          title='Editar Colaborador'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon' title='Operação'>
              <EllipsisVertical className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-40 p-0'>
            <div className='flex flex-col gap-2 p-0'>
              <Button
                variant='ghost'
                size={'sm'}
                onClick={() => configuredActions.onAddContract!(row)}
              >
                Novo Contrato
              </Button>
              {/* Adicione mais opções aqui conforme necessário */}
            </div>
          </PopoverContent>
        </Popover>
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

export const SubRowComponent = ({
  row,
  configuredActionsSubrows
}: {
  row: Row<IWorkerWithRelations>;
  configuredActionsSubrows: ActionHandlersSubrows;
}) => {
  const contracts = row.original.workerContracts || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>Contratos do Trabalhador:</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Contrato</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Unidade SIPAC</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            {/* <TableHead>Notas</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.length > 0 ? (
            contracts.map((contract, index) => (
              <TableRow key={index}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>
                  {contract.contract?.providers?.nomeFantasia ?? 'N/A'}
                </TableCell>
                <TableCell>{contract.workerSpecialty?.name || 'N/A'}</TableCell>
                <TableCell>
                  {contract.sipacUnitLocation?.nomeUnidade || 'N/A'}
                </TableCell>
                <TableCell>
                  {contract.startDate
                    ? formatOnlyDateToUTC(contract.startDate as any)
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {contract.endDate
                    ? formatOnlyDateToUTC(contract.endDate as any)
                    : 'N/A'}
                </TableCell>
                {/* <TableCell>{contract.notes || 'N/A'}</TableCell> */}
                {/* <TableCell>
                  <Badge
                    variant={
                      contract.endDate &&
                      new Date(contract.endDate) < new Date()
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {contract.endDate && new Date(contract.endDate) < new Date()
                      ? 'Inativo'
                      : 'Ativo'}
                  </Badge>
                  </TableCell> */}
                <TableCell>
                  <StatusBadge
                    status={contract.endDate ? 'Inativo' : 'Ativo'}
                  />
                </TableCell>
                <TableCell>
                  {' '}
                  <div className='flex gap-2'>
                    <Button
                      title='Editar Contrato'
                      variant='ghost'
                      size='icon'
                      onClick={() =>
                        configuredActionsSubrows.onEditContract(contract)
                      }
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='h-24 text-center'>
                Nenhum contrato encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
