import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { IUsuario } from '../../usuario-types';
import { getPublicFotoSigaa } from '../../../../../../lib/fetch/get-public-foto-sigaa';

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<IUsuario>();

// Define the actions type more specifically if possible, or keep as is
// Using Row<UsuarioWithRoles1> is often better than RowData
type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

// createActions será uma função que CRIA o objeto de ações,
// recebendo a função de navegação.
export const createActions = (
  router: AppRouterInstance // Recebe a função de navegação
): ActionHandlers<IUsuario> => ({
  onAdd: (row: Row<IUsuario>) => {
    console.log('Add usuario', row.original);
    router.push(
      `/user/add?name=${row.original['nome-pessoa']}&login=${row.original.login}&email=${row.original.email}`
    );
    // Implemente sua lógica de deleção aqui (ex: modal de confirmação, chamada de API)
  }
});

export const columns = (
  configuredActions: ActionHandlers<IUsuario>
): ColumnDef<IUsuario, any>[] => [
  columnHelper.accessor('nome-pessoa', {
    header: 'Nome',
    cell: (props) => {
      const usuario = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (usuario.nome)
      const loginValue = usuario.login; // Acesso à propriedade 'login' da mesma linha

      return (
        <div className='flex items-center gap-2 py-0.5'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={getPublicFotoSigaa(usuario['url-foto'])}
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
  columnHelper.accessor('id-institucional', {
    header: 'ID Intitucional',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('id-usuario', {
    header: 'ID SIG',
    cell: (props) => props.getValue()
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
          onClick={() => configuredActions.onAdd(row)}
        >
          <UserPlus className='h-4 w-4' />
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
