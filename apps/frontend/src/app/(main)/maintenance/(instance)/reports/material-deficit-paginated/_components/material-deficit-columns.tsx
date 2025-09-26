import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IMaintenanceRequestDeficitStatus } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { StatusBadge } from '@/components/ui/status-badge'; // Assumindo que este componente existe ou será criado
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Button } from '../../../../../../../components/ui/button';
import { Eye } from 'lucide-react';

const columnHelper = createColumnHelper<IMaintenanceRequestDeficitStatus>();

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

export const materialdeficitColumns = (
  configuredActions: ActionHandlers<IMaintenanceRequestDeficitStatus>
): ColumnDef<IMaintenanceRequestDeficitStatus, any>[] => [
  columnHelper.accessor('id', {
    header: 'ID Requisição',
    cell: (props) => props.getValue(),
    enableSorting: true,
    enableHiding: false
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
  columnHelper.accessor('hasEffectiveDeficit', {
    header: 'Déficit Efetivo',
    cell: (props) => (
      <StatusBadge status={`${props.getValue() ? 'Sim' : 'Não'}`} />
    ),
    meta: {
      filterVariant: 'select'
    }
  }),
  columnHelper.accessor('hasPotentialDeficit', {
    header: 'Déficit Potencial',
    cell: (props) => (
      <StatusBadge status={`${props.getValue() ? 'Sim' : 'Não'}`} />
    ),
    meta: {
      filterVariant: 'select'
    }
  }),
  // Coluna para exibir detalhes do déficit, se houver.
  // Esta coluna pode ser expandida para mostrar os 'deficitDetails'.
  // A implementação de um componente de expansão seria feita em outro local.
  columnHelper.display({
    id: 'deficitDetails',
    header: 'Detalhes do Déficit',
    cell: ({ row }) => {
      if (
        row.original.deficitDetails &&
        row.original.deficitDetails.length > 0
      ) {
        return (
          <span className='cursor-pointer text-blue-600'>
            Ver Detalhes ({row.original.deficitDetails.length})
          </span>
        );
      }
      return 'Nenhum déficit';
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
