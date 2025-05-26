import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IRoleList } from '../../role-types'; // Importa o tipo IRoleList
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { format } from 'date-fns'; // Para formatar datas
import { ptBR } from 'date-fns/locale'; // Se precisar de localização

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<IRoleList>(); // Usa IRoleList

// Define o tipo das ações
type ActionHandlers<TData> = {
  onEdit: (row: Row<TData>) => void;
  onDelete: (row: Row<TData>) => void;
};

// createActions será uma função que CRIA o objeto de ações,
// recebendo a função de navegação.
export const createActions = (
  router: AppRouterInstance // Recebe a função de navegação
): ActionHandlers<IRoleList> => ({
  onEdit: (row: Row<IRoleList>) => {
    console.log('Edit role', row.original);
    if (row.original.id) {
      // Navega para a rota de edição de role
      router.push(`/role/edit/${row.original.id}`); // Ajuste o caminho
    } else {
      console.error('Role ID is missing, cannot navigate to edit page.');
      throw new Error('Role ID is missing, cannot navigate to edit page.');
    }
  },
  onDelete: (row: Row<IRoleList>) => {
    console.log('Delete role', row.original);
    // Implemente sua lógica de deleção aqui (ex: modal de confirmação, chamada de API)
    alert(`Implementar exclusão para o papel: ${row.original.role}`);
  }
});

export const columns = (
  configuredActions: ActionHandlers<IRoleList>
): ColumnDef<IRoleList, any>[] => [
  columnHelper.accessor('role', {
    header: 'Papel',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Última Atualização',
    cell: (props) => {
      const date = props.getValue();
      return date
        ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
        : 'N/A';
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
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
