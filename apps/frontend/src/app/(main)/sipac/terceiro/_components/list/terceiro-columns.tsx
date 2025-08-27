import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react'; // TODO: Change icon to something more relevant for 'terceiro'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ITerceiro } from '../../terceiro-types';

const columnHelper = createColumnHelper<ITerceiro>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<ITerceiro> => ({
  onAdd: (row: Row<ITerceiro>) => {
    console.log('Add terceiro', row.original);
    // TODO: Implement specific navigation or action for adding a 'terceiro'
    // router.push(`/terceiro/add?name=${row.original['nome-contratado']}`);
  }
});

export const columns = (
  configuredActions: ActionHandlers<ITerceiro>
): ColumnDef<ITerceiro, any>[] => [
  columnHelper.accessor('nome-contratado', {
    header: 'Nome Contratado',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('cpf-contratado', {
    header: 'CPF Contratado',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('nome-fornecedor', {
    header: 'Nome Fornecedor',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('cnpj-fornecedor', {
    header: 'CNPJ Fornecedor',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('numero-contrato', {
    header: 'Número Contrato',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('vigente', {
    header: 'Vigente',
    cell: (props) => (props.getValue() ? 'Sim' : 'Não')
  }),

  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onAdd(row)}
        >
          <UserPlus className='h-4 w-4' /> {/* TODO: Change icon */}
        </Button>
      </div>
    )
  })
];
