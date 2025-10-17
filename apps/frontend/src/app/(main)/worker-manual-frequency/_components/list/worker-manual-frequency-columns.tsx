import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Edit,
  ChevronRight,
  ChevronDown,
  Trash,
  ArrowUpDown
} from 'lucide-react';
import { IWorkerManualFrequencyForContractsWithRelations } from '../../worker-manual-frequency-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { getDateUTC } from '../../../../../lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCodigoUnidade } from '../../../../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { deleteWorkerManualFrequency } from '../../worker-manual-frequency-actions';
import { QueryClient } from '@tanstack/react-query';

const columnHelper =
  createColumnHelper<IWorkerManualFrequencyForContractsWithRelations>();

export const defaultColumn: Partial<
  ColumnDef<IWorkerManualFrequencyForContractsWithRelations>
> = {
  size: 100,
  enableResizing: false,
  enableColumnFilter: false,
  filterFn: 'arrIncludesSome',
  cell: ({ getValue }) => {
    const value = getValue();
    if (value === null || value === undefined || value === '') {
      return <span className='text-muted-foreground'>N/A</span>;
    }
    return <div className='whitespace-normal'>{String(value)}</div>;
  }
};

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

type ActionHandlersSubrows = {
  [key: string]: (
    workerManualFrequency: IWorkerManualFrequencyForContractsWithRelations['workerManualFrequency'][number]
  ) => void;
};

export const createActionsSubrows = (
  router: AppRouterInstance,
  queryClient: QueryClient
): ActionHandlersSubrows => {
  const [isPending, startTransition] = useTransition();

  const handleDeleteManualFrequency = async (id: number) => {
    startTransition(async () => {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      const result = await deleteWorkerManualFrequency(id);
      if (result) {
        startTransition(() => {
          //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
          toast.success(result);
          queryClient.invalidateQueries({
            queryKey: ['workerManualFrequenciesForSpecialties']
          }); // Invalida o cache do react-query
        });
      }
    });
  };

  return {
    onEditWorkerManualFrequency: (
      workerManualFrequency: IWorkerManualFrequencyForContractsWithRelations['workerManualFrequency'][number]
    ) => {
      console.log('Edit workerManualFrequency', workerManualFrequency);
      if (workerManualFrequency.id) {
        router.push(`worker-manual-frequency/edit/${workerManualFrequency.id}`);
      } else {
        console.error(
          'WorkerManualFrequency ID is missing, cannot navigate to edit page.'
        );
        throw new Error(
          'WorkerManualFrequency ID is missing, cannot navigate to edit page.'
        );
      }
    },
    onDeleteWorkerManualFrequency: (
      workerManualFrequency: IWorkerManualFrequencyForContractsWithRelations['workerManualFrequency'][number]
    ) => {
      console.log('Delete workerManualFrequency', workerManualFrequency);

      handleDeleteManualFrequency(workerManualFrequency.id);
      // Implement toast logic here
    }
  };
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWorkerManualFrequencyForContractsWithRelations> => ({
  onEdit: (row: Row<IWorkerManualFrequencyForContractsWithRelations>) => {
    if (row.original.id) {
      router.push(`worker-manual-frequency/edit/${row.original.id}`);
    } else {
      console.error(
        'WorkerManualFrequency ID is missing, cannot navigate to edit page.'
      );
      throw new Error(
        'WorkerManualFrequency ID is missing, cannot navigate to edit page.'
      );
    }
  }
});

export const columns = (
  configuredActions: ActionHandlers<IWorkerManualFrequencyForContractsWithRelations>
): ColumnDef<IWorkerManualFrequencyForContractsWithRelations, any>[] => [
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
  columnHelper.accessor('worker.name', {
    header: 'Colaborador',
    id: 'name',
    size: 500,
    enableResizing: false,
    cell: (props) => {
      const worker = props.row.original.worker;
      const nameValue = props.getValue();

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
  columnHelper.accessor('workerSpecialty.name', {
    header: 'Especialidade',
    size: 200,
    enableResizing: false
  }),
  columnHelper.accessor('contract.codigoSipac', {
    header: 'Contrato',
    size: 100,
    enableResizing: false
  }),
  columnHelper.accessor('contract.providers.nomeFantasia', {
    header: 'Empresa',
    size: 200
  }),
  columnHelper.accessor('startDate', {
    header: 'Início Contrato',
    size: 120,
    enableResizing: false,
    enableColumnFilter: false,
    cell: (props) => {
      return (
        <div className='text-center'>
          {props.getValue()
            ? format(new Date(props.getValue()), 'P', { locale: ptBR })
            : 'N/A'}
        </div>
      );
    }
  }),
  columnHelper.accessor('sipacUnitLocation.sigla', {
    //lotacao refere-se ao local de trabalaho
    header: 'Lotação',
    size: 200
  }),
  columnHelper.accessor('worker.maintenanceInstance.name', {
    //instancia refere-se a quem gerencia (as vezes o trabalhador é lotado na escola de musica mas quem gerencia as faltas é a diman)
    header: 'Instância',
    size: 200
  }),

  // reduce for total hours abscence
  columnHelper.accessor(
    (row) =>
      row.workerManualFrequency.reduce((acc, curr) => {
        if (curr.hours && curr.workerManualFrequencyTypeId === 1) {
          acc += Number(curr.hours);
        }
        return acc;
      }, 0),
    {
      id: 'totalHoursAbscence',
      header: ({ column }) => (
        <div
          className='flex cursor-pointer items-center text-center whitespace-normal'
          onClick={() => column.toggleSorting()}
        >
          Horas Ausentes
          <ArrowUpDown className='text-muted-foreground ml-1 h-4 w-4' />
        </div>
      ),
      size: 150,
      enableResizing: false,
      enableColumnFilter: false,
      cell: (props) => <div className='text-center'>{props.getValue()}</div>
    }
  ),

  // reduce for total dias abscence
  columnHelper.accessor(
    (row) =>
      row.workerManualFrequency.reduce((acc, curr) => {
        if (curr.workerManualFrequencyTypeId === 1) {
          acc += 1;
        }
        return acc;
      }, 0),
    {
      id: 'totalDaysAbscence',
      header: ({ column }) => (
        <div
          className='flex cursor-pointer items-center text-center whitespace-normal'
          onClick={() => column.toggleSorting()}
        >
          Dias Ausentes
          <ArrowUpDown className='text-muted-foreground ml-1 h-4 w-4' />
        </div>
      ),
      size: 150,
      enableResizing: false,
      enableColumnFilter: false,
      cell: (props) => <div className='text-center'>{props.getValue()}</div>
    }
  )

  // columnHelper.display({
  //   id: 'actions',
  //   size: 100,
  //   header: 'Ações',
  //   cell: ({ row }) => (
  //     <div className='flex gap-2'>
  //       <Button
  //         title='Editar Frequência'
  //         variant='ghost'
  //         size='icon'
  //         onClick={() => configuredActions.onEdit(row)}
  //       >
  //         <Edit className='h-4 w-4' />
  //       </Button>
  //     </div>
  //   )
  // })
];

function getAvatarInitials(
  login: string | undefined,
  name: string | undefined
): string {
  if (name) {
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
  } else return 'W';
}

export const SubRowComponent = ({
  row,
  configuredActionsSubrows
}: {
  row: Row<IWorkerManualFrequencyForContractsWithRelations>;
  configuredActionsSubrows: ActionHandlersSubrows;
}) => {
  const workerManualFrequencies = row.original.workerManualFrequency || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>Frequências Manuais:</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-40'>Tipo</TableHead>
            <TableHead className='w-50'>Data</TableHead>
            <TableHead className='w-30 text-center'>Horas</TableHead>
            <TableHead className='w-40'>Lançado por</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className='w-30 text-center'>Criado em</TableHead>
            <TableHead className='w-30 text-center'>Atualizado em</TableHead>
            <TableHead className='w-25 text-center'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workerManualFrequencies.length > 0 ? (
            workerManualFrequencies.map((frequency, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant='outline'>
                    {frequency.workerManualFrequencyType?.type || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {frequency.date
                    ? format(getDateUTC(frequency.date as any), 'PPPP', {
                        locale: ptBR
                      })
                    : 'N/A'}
                </TableCell>
                <TableCell className='text-center'>
                  {frequency.hours || 'N/A'}
                </TableCell>
                <TableCell>{frequency.user?.login || 'N/A'}</TableCell>

                <TableCell>{frequency.notes || 'N/A'}</TableCell>
                <TableCell className='text-center'>
                  <div>
                    {new Date(frequency.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    {new Date(frequency.createdAt).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <div>
                    {new Date(frequency.updatedAt).toLocaleDateString()}
                  </div>
                  <div>
                    {new Date(frequency.updatedAt).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button
                      title='Editar Frequência Manual'
                      variant='ghost'
                      size='icon'
                      onClick={() =>
                        configuredActionsSubrows.onEditWorkerManualFrequency(
                          frequency
                        )
                      }
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      title='Excluir Frequência Manual'
                      variant='ghost'
                      size='icon'
                      onClick={() =>
                        configuredActionsSubrows.onDeleteWorkerManualFrequency(
                          frequency
                        )
                      }
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='h-24 text-center'>
                Nenhuma frequência manual encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
