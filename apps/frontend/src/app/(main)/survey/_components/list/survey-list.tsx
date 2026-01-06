'use client';

import { columns, createActions } from './survey-columns';
import { ISurveyWithRelations } from '../../survey-types';
import { Button } from '@/components/ui/button';
import { FilePlus, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { getRefreshedSurveys } from '../../survey-actions';
import { SectionListHeader } from '../../../../../components/section-list-header';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';

interface Props {
  initialSurveys: ISurveyWithRelations[];
}

export function SurveyListPage({ initialSurveys }: Props) {
  const router = useRouter();

  const [surveys, setSurveys] = useState(initialSurveys);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const handleClearFilters = () => {
    setGlobalFilterValue('');
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'createdAt',
      desc: true
    }
  ]);

  const handleRefresh = async () => {
    await getRefreshedSurveys();
    router.refresh();
  };

  const handleAddSurvey = () => {
    router.push('survey/add');
  };

  const handleDeleteSuccess = (id: string) => {
    setSurveys(surveys.filter((survey) => survey.id !== id));
    handleRefresh();
  };

  const columnActions = createActions(router, handleDeleteSuccess);

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Enquetes'
        subtitle='Crie, edite e gerencie enquetes.'
        TitleIcon={ListChecks}
        actionButton={{
          text: 'Nova Pesquisa',
          onClick: handleAddSurvey,
          variant: 'default',
          Icon: FilePlus
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <DefaultGlobalFilter
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
          label={'Pesquisa'}
        />
      </div>

      <TableTanstack
        data={surveys}
        columns={columns(columnActions)}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        globalFilterFn='includesString'
        globalFilter={globalFilterValue}
        setGlobalFilter={setGlobalFilterValue}
      />
    </div>
  );
}
