'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { SectionListHeader } from '../../../../../../components/section-list-header';
import {
  ColumnDef,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { columns, createActions } from './usuario-columns';
import { IUsuario } from '../../usuario-types';
import { UsuarioSearch } from './usuario-search';
import { UsuarioTable } from './usario-table';

export function UsuarioList() {
  const router = useRouter(); // Obtenha a função de navegação

  const [usuarios, setUsuario] = useState<IUsuario[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 100 //default page size
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'nome-pessoa',
      desc: false
    }
  ]); // can set initial sorting state here

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Usuario da UFRN'
        subtitle='Recurso para importar usuario da UFRN para o cadastro do SISMAN'
        TitleIcon={UserCog}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        {' '}
        {/* Ajuste altura se necessário */}
        <UsuarioSearch
          // Passa os valores e setters para o componente filho
          setUsuario={setUsuario}
        />
      </div>

      <UsuarioTable
        usuarios={usuarios} // Passa os dados (potencialmente já filtrados se a lógica for no backend)
        // Passa o estado calculado dos filtros para a tabela
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        columns={columns(columnActions)}
      />
    </div>
  );
}

export interface UsuarioTableProps {
  usuarios: IUsuario[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<any>>;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  sorting: SortingState;
  columns: ColumnDef<IUsuario, any>[];
}
