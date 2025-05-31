import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { IUsuario } from '../../usuario-types';

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
  onEdit: (row: Row<IUsuario>) => {
    console.log('Edit usuario', row.original);
    // Certifique-se que row.original.id existe e é o identificador correto.
    // Se seu ID estiver em outra propriedade (ex: _id, usuarioId), ajuste abaixo.
    if (row.original['id-institucional']) {
      // Navega para a rota de edição, passando o ID do usuário
      // Ajuste o caminho '/admin/usuarios/edit/' conforme sua estrutura de rotas
      router.push(`usuario/edit/${row.original['id-institucional']}`);
    } else {
      console.error('Usuario ID is missing, cannot navigate to edit page.');
      // Poderia também navegar para uma página de erro ou mostrar um alerta
      throw new Error('Usuario ID is missing, cannot navigate to edit page.');
    }
  },
  onDelete: (row: Row<IUsuario>) => {
    console.log('Delete usuario', row.original);
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
      const loginValue = usuario.email; // Acesso à propriedade 'login' da mesma linha

      return (
        <div className='flex items-center gap-2 py-0.5'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={usuario['url-foto']}
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
  columnHelper.accessor('ativo', {
    header: 'Ativo',
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
