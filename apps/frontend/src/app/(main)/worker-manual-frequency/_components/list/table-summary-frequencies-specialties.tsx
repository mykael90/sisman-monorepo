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
  const groupedData = workerManualFrequencies?.reduce(
    (acc, specialty) => {
      specialty.workerContracts.forEach((contract) => {
        const contractId = contract.contract?.codigoSipac || 'N/A';
        const providerName =
          contract.contract?.providers?.nomeFantasia ||
          contract.contract?.providers?.razaoSocial ||
          contract.contract?.providers?.nome ||
          'N/A';
        const groupKey = `${contractId}-${providerName}`;

        if (!acc[groupKey]) {
          acc[groupKey] = {
            contractId,
            providerName,
            specialties: {}
          };
        }

        const { hours: totalHoursAbsence, days: totalDaysAbsence } = (
          contract.workerManualFrequency as IWorkerManualFrequencyWithRelations[]
        ).reduce(
          (
            freqAcc: { hours: number; days: number },
            frequency: IWorkerManualFrequencyWithRelations
          ) => {
            if (
              frequency.hours &&
              frequency.workerManualFrequencyType?.id === 1
            ) {
              freqAcc.hours += Number(frequency.hours);
              freqAcc.days += 1;
            }
            return freqAcc;
          },
          { hours: 0, days: 0 }
        );

        const specialtyKey = specialty.name;
        if (!acc[groupKey].specialties[specialtyKey]) {
          acc[groupKey].specialties[specialtyKey] = {
            specialtyName: specialty.name,
            totalHoursAbsence: 0,
            totalDaysAbsence: 0
          };
        }

        acc[groupKey].specialties[specialtyKey].totalHoursAbsence +=
          totalHoursAbsence;
        acc[groupKey].specialties[specialtyKey].totalDaysAbsence +=
          totalDaysAbsence;
      });
      return acc;
    },
    {} as Record<
      string,
      {
        contractId: string;
        providerName: string;
        specialties: Record<
          string,
          {
            specialtyName: string;
            totalHoursAbsence: number;
            totalDaysAbsence: number;
          }
        >;
      }
    >
  );

  if (!groupedData || Object.keys(groupedData).length === 0) {
    return null; // Ou uma mensagem de "nenhum dado"
  }

  return (
    <div className='flex flex-col gap-6'>
      {Object.values(groupedData).map((group) => (
        <div
          key={`${group.contractId}-${group.providerName}`}
          className='h-auto rounded-xl border-0 bg-white px-4 py-3.5'
        >
          <h3 className='mb-4 text-lg font-semibold'>
            Resumo de Frequências por Especialidade - Contrato:{' '}
            {group.contractId} - Empresa: {group.providerName}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especialidade</TableHead>
                <TableHead className='text-right'>Horas de Falta</TableHead>
                <TableHead className='text-right'>Dias de Falta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(group.specialties).map((specialty, index) => (
                <TableRow key={index}>
                  <TableCell className='font-medium'>
                    {specialty.specialtyName}
                  </TableCell>
                  <TableCell className='text-right'>
                    {specialty.totalHoursAbsence.toFixed(2)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {specialty.totalDaysAbsence}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
