import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IMaintenanceRequestDeficitStatus } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Button } from '../../../../../../../components/ui/button';
import { Eye } from 'lucide-react';
import { get } from 'http';

const columnHelper = createColumnHelper<IMaintenanceRequestDeficitStatus>();

export const defaultColumn: Partial<
  ColumnDef<IMaintenanceRequestDeficitStatus>
> = {
  // Largura padrão
  // size: 150,
  enableResizing: true,
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
// Using Row<UserWithRoles1> is often better than RowData
type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

// createActions será uma função que CRIA o objeto de ações,
// recebendo a função de navegação.
export const createActions = (
  router: AppRouterInstance // Recebe a função de navegação
): ActionHandlers<IMaintenanceRequestDeficitStatus> => ({
  onViewDetails: (row: Row<IMaintenanceRequestDeficitStatus>) => {
    console.log('View details for deficit', row.original);
    // Certifique-se que row.original.id existe e é o identificador correto.
    if (row.original.id) {
      // Navega para a rota de edição, passando o ID da manutenção
      // Ajuste o caminho conforme sua estrutura de rotas
      router.push(`maintenance-deficit/details/${row.original.id}`);
    } else {
      console.error('Maintenance ID is missing, cannot navigate to view page.');
      // Poderia também navegar para uma página de erro ou mostrar um alerta
      throw new Error(
        'Maintenance ID is missing, cannot navigate to view page.'
      );
    }
  }
});

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Ativo':
      case 'Sim':
        return 'bg-red-100 text-red-800';
      case 'Inativo':
      case 'Não':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}

export const materialdeficitColumns = (
  configuredActions: ActionHandlers<IMaintenanceRequestDeficitStatus>
): ColumnDef<IMaintenanceRequestDeficitStatus, any>[] => [
  // columnHelper.accessor('id', {
  //   header: 'ID Requisição',
  //   cell: (props) => props.getValue(),
  //   enableSorting: true,
  //   enableHiding: false
  // }),
  columnHelper.accessor('protocolNumber', {
    header: 'RMan',
    size: 40,
    enableResizing: false,
    cell: (props) => props.getValue()
  }),

  columnHelper.accessor('description', {
    header: 'Descrição',
    size: 400,
    enableResizing: false,
    cell: (props) => (
      <div className='whitespace-normal'>{props.getValue()}</div>
    ),
    enableSorting: true,
    enableHiding: false
  }),

  columnHelper.accessor('sipacUserLoginRequest', {
    header: 'Usuário',
    size: 40,
    enableResizing: false,
    enableColumnFilter: true,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor(
    (row) =>
      row.loginsResponsibles?.length ? row.loginsResponsibles[0] : 'N/A',
    {
      header: 'Responsável',
      size: 40,
      enableResizing: false,
      enableColumnFilter: true,
      cell: (props) => props.getValue()
    }
  ),
  columnHelper.accessor((row) => (row.hasEffectiveDeficit ? 'Sim' : 'Não'), {
    id: 'hasEffectiveDeficit',
    header: 'Déficit Efetivo',
    size: 70,
    enableResizing: false,
    enableColumnFilter: true,
    cell: (props) => <StatusBadge status={props.getValue()}></StatusBadge>,
    meta: {
      filterVariant: 'select'
    }
  }),
  columnHelper.accessor((row) => (row.hasPotentialDeficit ? 'Sim' : 'Não'), {
    id: 'hasPotentialDeficit',
    header: 'Déficit Potencial',
    size: 70,
    enableResizing: false,
    enableColumnFilter: true,
    cell: (props) => <StatusBadge status={props.getValue()}></StatusBadge>,
    meta: {
      filterVariant: 'select'
    }
  }),
  // Coluna para exibir detalhes do déficit, se houver.
  // Esta coluna pode ser expandida para mostrar os 'deficitDetails'.
  // A implementação de um componente de expansão seria feita em outro local.
  // columnHelper.display({
  //   id: 'deficitDetails',
  //   header: 'Detalhes do Déficit',
  //   cell: ({ row }) => {
  //     if (
  //       row.original.deficitDetails &&
  //       row.original.deficitDetails.length > 0
  //     ) {
  //       return (
  //         <span className='cursor-pointer text-blue-600'>
  //           Ver Detalhes ({row.original.deficitDetails.length})
  //         </span>
  //       );
  //     }
  //     return 'Nenhum déficit';
  //   }
  // }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      // Mantém a estrutura original da célula Actions com botões
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onViewDetails(row)}
        >
          <Eye className='h-4 w-4' />
        </Button>
      </div>
    )
  })
];

// O componente StatusBadge foi movido para um arquivo separado em '@/components/ui/status-badge'
// para ser reutilizável. Se não existir, precisará ser criado.
