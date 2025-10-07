import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { IWorkerManualFrequencyWithRelations } from '../../worker-manual-frequency-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { getDateUTC } from '../../../../../lib/utils';
import { Badge } from '@/components/ui/badge';

const columnHelper = createColumnHelper<IWorkerManualFrequencyWithRelations>();

export const defaultColumn: Partial<
  ColumnDef<IWorkerManualFrequencyWithRelations>
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

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWorkerManualFrequencyWithRelations> => ({
  onEdit: (row: Row<IWorkerManualFrequencyWithRelations>) => {
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
  configuredActions: ActionHandlers<IWorkerManualFrequencyWithRelations>
): ColumnDef<IWorkerManualFrequencyWithRelations, any>[] => [
  columnHelper.accessor('worker.name', {
    header: 'Colaborador',
    size: 320,
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
  columnHelper.accessor('date', {
    header: 'Data',
    size: 100,
    cell: (props) => {
      if (!props.getValue()) {
        return 'indefinido';
      }
      const onlyUTCDate = getDateUTC(props.getValue());
      return onlyUTCDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }),
  columnHelper.accessor('workerManualFrequencyType.type', {
    header: 'Tipo de Frequência',
    size: 200,
    cell: (props) => <Badge variant='outline'>{props.getValue()}</Badge>
  }),
  columnHelper.accessor('user.login', {
    header: 'Lançado por',
    size: 200
  }),
  columnHelper.accessor('hours', {
    header: 'Horas',
    size: 100
  }),
  columnHelper.accessor('createdAt', {
    header: 'Criado em',
    size: 150,
    cell: (props) => {
      if (!props.getValue()) {
        return 'indefinido';
      }
      const onlyUTCDate = getDateUTC(props.getValue());
      return onlyUTCDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Atualizado em',
    size: 150,
    cell: (props) => {
      if (!props.getValue()) {
        return 'indefinido';
      }
      const onlyUTCDate = getDateUTC(props.getValue());
      return onlyUTCDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }),
  columnHelper.display({
    id: 'actions',
    size: 100,
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          title='Editar Frequência'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
      </div>
    )
  })
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
