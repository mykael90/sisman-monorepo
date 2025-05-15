import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IUserList } from '../../users-types';

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<IUserList>();

// Define the actions type more specifically if possible, or keep as is
// Using Row<UserWithRoles1> is often better than RowData
type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

// Use the more specific ActionHandlers type if you changed it above
const actions: ActionHandlers<IUserList> = {
  // Pass the row object directly, which is Row<UserWithRoles1>
  onEdit: (row: Row<IUserList>) => {
    console.log('Edit user', row.original); // Access original data
  },
  onDelete: (row: Row<IUserList>) => {
    console.log('Delete user', row.original);
  }
};

const columns = (
  actions: ActionHandlers<IUserList>
): ColumnDef<IUserList, any>[] => [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: (props) => {
      const user = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (user.name)
      const loginValue = user.login; // Acesso à propriedade 'login' da mesma linha

      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={user.image}
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
  columnHelper.accessor('login', {
    header: 'Login',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('isActive', {
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
        <Button variant='ghost' size='icon' onClick={() => actions.onEdit(row)}>
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => actions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    )
  })
];
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
  } else return 'U';
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === 'Active'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status}
    </span>
  );
}

export { columns, actions };
