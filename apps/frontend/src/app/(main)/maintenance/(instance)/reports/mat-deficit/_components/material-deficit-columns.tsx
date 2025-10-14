import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IMaintenanceRequestDeficitStatus } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Button } from '../../../../../../../components/ui/button';
import { Eye, ChevronRight, ChevronDown, RefreshCcw } from 'lucide-react';
import { get } from 'http';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { QueryClient } from '@tanstack/react-query';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { fetchOneAndPersistSipacRequisicoesManutencao } from '../../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';

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
  router: AppRouterInstance, // Recebe a função de navegação
  queryClient: QueryClient
): ActionHandlers<IMaintenanceRequestDeficitStatus> => {
  const [isPending, startTransition] = useTransition();

  const handleSyncRManSipac = async (protocolNumber?: string) => {
    if (!protocolNumber)
      return toast.error(
        `Requisição de material não localizada para essa reserva.`
      );

    startTransition(async () => {
      const updateRequisicaoManutencaoSipac =
        await fetchOneAndPersistSipacRequisicoesManutencao(protocolNumber);
      if (updateRequisicaoManutencaoSipac) {
        // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

        startTransition(() => {
          //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
          toast.success(
            `Requisição de manutenção nº ${protocolNumber} sincronizada do SIPAC com sucesso!`
          );
          queryClient.invalidateQueries({ queryKey: ['deficits'] }); // Invalida o cache do react-query
        });
      } else {
        toast.error(
          `Falha ao sincronizar requisição de manutenção nº ${protocolNumber} do SIPAC. Verifique os dados e tente novamente.`
        );
      }
    });
  };

  return {
    onViewDetails: (row: Row<IMaintenanceRequestDeficitStatus>) => {
      console.log('View details for deficit', row.original);
      // Certifique-se que row.original.id existe e é o identificador correto.
      if (row.original.id) {
        // Navega para a rota de edição, passando o ID da manutenção
        // Ajuste o caminho conforme sua estrutura de rotas
        router.push(`/maintenance/request/show/${row.original.id}`);
      } else {
        console.error(
          'Maintenance ID is missing, cannot navigate to view page.'
        );
        // Poderia também navegar para uma página de erro ou mostrar um alerta
        throw new Error(
          'Maintenance ID is missing, cannot navigate to view page.'
        );
      }
    },
    onSyncRMan: (row: Row<IMaintenanceRequestDeficitStatus>) => {
      handleSyncRManSipac(row.original.protocolNumber);
    }
  };
};

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
  columnHelper.display({
    id: 'expander',
    size: 30,
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
  columnHelper.accessor('protocolNumber', {
    header: 'RMan',
    size: 40,
    enableResizing: false,
    cell: (props) => {
      if (!props.row.original.protocolNumber) {
        return 'N/A';
      }

      const updateDate = new Date(props.row.original.updatedAt);

      return (
        <div className='space-y-.5 flex-col items-center whitespace-normal'>
          <div>{props.getValue()}</div>
          <div className='flex items-center justify-center gap-1'>
            <div className='text-muted-foreground text-xs'>
              {updateDate.toLocaleDateString()}{' '}
            </div>
            {/* <Button
              variant='ghost'
              onClick={() => {
                configuredActions.onView(props.row);
              }}
              className='h-3 w-3 cursor-pointer'
            >
              <RefreshCcw className='h-3 w-3' />
            </Button> */}
          </div>
        </div>
      );
    }
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
    header: 'Requisitante',
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
        <Button
          title='Sincronizar RMan com SIPAC'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onSyncRMan(row)}
        >
          <RefreshCcw className='h-4 w-4' />
        </Button>
      </div>
    )
  })
];

// O componente StatusBadge foi movido para um arquivo separado em '@/components/ui/status-badge'
// para ser reutilizável. Se não existir, precisará ser criado.

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaintenanceRequestDeficitStatus>;
}) => {
  const deficitDetails = row.original.deficitDetails || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>Detalhes do Déficit:</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Material</TableHead>
            <TableHead>Denominação</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Qtd Solicitada</TableHead>
            <TableHead>Qtd Recebida</TableHead>
            <TableHead>Qtd Retirada</TableHead>
            <TableHead>Saldo Efetivo</TableHead>
            <TableHead>Saldo Potencial</TableHead>
            <TableHead>Valor Unitário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deficitDetails.length > 0 ? (
            deficitDetails.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.globalMaterialId}</TableCell>
                <TableCell className='whitespace-normal'>
                  {item.name || 'N/A'}
                </TableCell>
                <TableCell>{item.unitOfMeasure || 'N/A'}</TableCell>
                <TableCell>{item.quantityRequestedSum.toString()}</TableCell>
                <TableCell>{item.quantityReceivedSum.toString()}</TableCell>
                <TableCell>{item.quantityWithdrawnSum.toString()}</TableCell>
                <TableCell>{item.effectiveBalance.toString()}</TableCell>
                <TableCell>{item.potentialBalance.toString()}</TableCell>
                <TableCell>
                  {item.unitPrice
                    ? Number(item.unitPrice).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    : 'Indefinido'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className='h-24 text-center'>
                Nenhum detalhe de déficit encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
