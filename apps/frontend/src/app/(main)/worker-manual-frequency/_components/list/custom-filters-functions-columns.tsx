import { FilterFn, Row } from '@tanstack/react-table';
import { IWorkerManualFrequencyForContractsWithRelations } from '../../worker-manual-frequency-types';

export const exactMatchFilter: FilterFn<
  IWorkerManualFrequencyForContractsWithRelations
> = (row, columnId, filterValue: string | string[]) => {
  const cellValue = row.getValue<string>(columnId);
  const normalizedCellValue = cellValue.toLowerCase().trim();

  if (
    !filterValue ||
    (Array.isArray(filterValue) && filterValue.length === 0)
  ) {
    return true; // Retorna todos os valores se o filtro for vazio ou nulo
  }

  const filterValues = Array.isArray(filterValue)
    ? filterValue.map((val) => String(val).toLowerCase().trim())
    : [String(filterValue).toLowerCase().trim()];

  return filterValues.some((val) => normalizedCellValue === val);
};
