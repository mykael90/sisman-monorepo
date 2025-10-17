'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../../components/ui/table';
import {
  IWorkerManualFrequencyForSpecialtiesWithRelations,
  IWorkerManualFrequencyWithRelations
} from '../../worker-manual-frequency-types';

interface TableSummaryFrequenciesSpecialtiesProps {
  workerManualFrequencies:
    | IWorkerManualFrequencyForSpecialtiesWithRelations[]
    | undefined;
}

export function TableSummaryFrequenciesSpecialties({
  workerManualFrequencies
}: TableSummaryFrequenciesSpecialtiesProps) {
  return (
    <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
      <h3 className='mb-4 text-lg font-semibold'>
        Resumo de Frequências Manuais por Especialidade
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Especialidade</TableHead>
            <TableHead className='text-right'>
              Total de Horas de Falta
            </TableHead>
            <TableHead className='text-right'>Total de Dias de Falta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workerManualFrequencies?.map((specialty) => {
            const { totalHoursAbsence, totalDaysAbsence } =
              specialty.workerContracts.reduce(
                (acc, contract) => {
                  const contractAbsence = (
                    contract.workerManualFrequency as IWorkerManualFrequencyWithRelations[]
                  ).reduce(
                    (
                      contractAcc: { hours: number; days: number },
                      frequency: IWorkerManualFrequencyWithRelations
                    ) => {
                      if (
                        frequency.hours &&
                        frequency.workerManualFrequencyType?.id === 1
                      ) {
                        contractAcc.hours += Number(frequency.hours);
                        contractAcc.days += 1;
                      }
                      return contractAcc;
                    },
                    { hours: 0, days: 0 }
                  );
                  acc.totalHoursAbsence += contractAbsence.hours;
                  acc.totalDaysAbsence += contractAbsence.days;
                  return acc;
                },
                { totalHoursAbsence: 0, totalDaysAbsence: 0 }
              );

            return (
              <TableRow key={specialty.id}>
                <TableCell className='font-medium'>{specialty.name}</TableCell>
                <TableCell className='text-right'>
                  {totalHoursAbsence.toFixed(2)}
                </TableCell>
                <TableCell className='text-right'>{totalDaysAbsence}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
