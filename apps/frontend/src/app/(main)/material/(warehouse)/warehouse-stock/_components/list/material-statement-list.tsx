'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import Loading from '@/components/loading';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import {
  PaginationState,
  Row,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { getStockMovementsByWarehouseAndMaterial } from '../../../stock-movement/stock-movement-actions';
import {
  materialOperationInDisplayMapPorguguese,
  materialOperationOutDisplayMapPorguguese,
  materialOperationAdjustmentDisplayMapPorguguese,
  materialOperationReservationDisplayMapPorguguese,
  materialOperationRestrictionDisplayMapPorguguese,
  TMaterialOperationInKey,
  TMaterialOperationOutKey,
  TMaterialOperationAdjustmentKey,
  TMaterialOperationReservationKey,
  TMaterialOperationRestrictionKey,
  materialOperationTypeDisplayMapPortuguese,
  TMaterialOperationTypeKey
} from '@/mappers/material-operations-mappers-translate';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';

// Definindo as interfaces para os dados do extrato
interface IMovementType {
  operation: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVATION' | 'RESTRICTION';
  code: string;
}

interface IMaterialRequest {
  id: number;
  protocolNumber: string;
}

interface IMaterialRequestItem {
  materialRequest: IMaterialRequest;
}

interface IGlobalMaterial {
  id: string;
  name: string;
  description: string;
  unitOfMeasure: string;
}

interface IWarehouse {
  id: number;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
  maintenanceInstanceId: number;
  createdAt: string;
  updatedAt: string;
  isSystemDefault: boolean;
  defaultForInstance: boolean;
}

interface IProcessedByUser {
  id: number;
  name: string;
}

interface ICollectedByWorker {
  id: number;
  name: string;
}

interface IMaintenanceRequest {
  id: number;
  protocolNumber: string;
}

export interface IMaterialStatement {
  id: number;
  warehouseId: number;
  globalMaterialId: string;
  materialInstanceId: null;
  movementTypeId: number;
  quantity: string;
  movementDate: string;
  unitPrice: string | null;
  createdAt: string;
  updatedAt: string;
  processedByUserId: number;
  collectedByUserId: number | null;
  collectedByWorkerId: number | null;
  warehouseMaterialStockId: number;
  materialRequestItemId: number | null;
  maintenanceRequestId: number | null;
  materialWithdrawalItemId: number | null;
  materialRestrictionItemId: number | null;
  materialPickingOrderItemId: number | null;
  materialReceiptItemId: number | null;
  stockTransferOrderItemId: number | null;
  collectedByUser: null;
  collectedByWorker: ICollectedByWorker | null;
  movementType: IMovementType;
  materialRequestItem: IMaterialRequestItem | null;
  globalMaterial: IGlobalMaterial;
  warehouse: IWarehouse;
  maintenanceRequest: IMaintenanceRequest | null;
  processedByUser: IProcessedByUser;
}

interface MaterialStatementListProps {
  globalMaterialId: string;
  warehouseId: number;
}

const columnHelper = createColumnHelper<IMaterialStatement>();

const DEFAULT_PAGINATION_STATE: PaginationState = {
  pageIndex: 0,
  pageSize: 10
};

export function MaterialStatementList({
  globalMaterialId,
  warehouseId
}: MaterialStatementListProps) {
  const {
    data: statementData,
    isLoading,
    isError,
    error
  } = useQuery<IMaterialStatement[], Error>({
    queryKey: ['materialStatement', warehouseId, globalMaterialId],
    queryFn: () =>
      getStockMovementsByWarehouseAndMaterial(warehouseId, globalMaterialId),
    enabled: !!warehouseId && !!globalMaterialId
  });

  const [pagination, setPagination] = useState<PaginationState>(
    DEFAULT_PAGINATION_STATE
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const getRowClassName = (row: Row<IMaterialStatement>) => {
    const operation = row.original.movementType.operation;
    switch (operation) {
      case 'IN':
        return 'bg-green-50 hover:bg-green-100';
      case 'OUT':
        return 'bg-red-50 hover:bg-red-100';
      case 'ADJUSTMENT':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'RESERVATION':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'RESTRICTION':
        return 'bg-purple-50 hover:bg-purple-100';
      default:
        return 'hover:bg-accent/10';
    }
  };

  const columns: ColumnDef<IMaterialStatement, any>[] = useMemo(
    () => [
      columnHelper.accessor(
        (row) =>
          materialOperationTypeDisplayMapPortuguese[
            row.movementType.operation as TMaterialOperationTypeKey
          ] || row.movementType.operation.replace('_', ' '),
        {
          id: 'operationType',
          header: 'Tipo Operação',
          cell: (props) => {
            const operation = props.row.original.movementType.operation;
            let colorClass = '';
            switch (operation) {
              case 'IN':
                colorClass = 'bg-green-100 text-green-800';
                break;
              case 'OUT':
                colorClass = 'bg-red-100 text-red-800';
                break;
              case 'ADJUSTMENT':
                colorClass = 'bg-yellow-100 text-yellow-800';
                break;
              case 'RESERVATION':
                colorClass = 'bg-blue-100 text-blue-800';
                break;
              case 'RESTRICTION':
                colorClass = 'bg-purple-100 text-purple-800';
                break;
              default:
                colorClass = 'bg-gray-100 text-gray-800';
            }
            return (
              <Badge className={cn('capitalize', colorClass)}>
                {props.getValue()}
              </Badge>
            );
          },
          enableColumnFilter: true,
          filterFn: 'arrIncludesSome'
        }
      ),
      columnHelper.accessor(
        (row) => {
          const { code: operationCode, operation: operationType } =
            row.movementType;

          switch (operationType) {
            case 'IN':
              return (
                materialOperationInDisplayMapPorguguese[
                  operationCode as TMaterialOperationInKey
                ] || operationCode
              );
            case 'OUT':
              return (
                materialOperationOutDisplayMapPorguguese[
                  operationCode as TMaterialOperationOutKey
                ] || operationCode
              );
            case 'ADJUSTMENT':
              return (
                materialOperationAdjustmentDisplayMapPorguguese[
                  operationCode as TMaterialOperationAdjustmentKey
                ] || operationCode
              );
            case 'RESERVATION':
              return (
                materialOperationReservationDisplayMapPorguguese[
                  operationCode as TMaterialOperationReservationKey
                ] || operationCode
              );
            case 'RESTRICTION':
              return (
                materialOperationRestrictionDisplayMapPorguguese[
                  operationCode as TMaterialOperationRestrictionKey
                ] || operationCode
              );
            default:
              return operationCode.replace(/_/g, ' ').toLowerCase();
          }
        },
        {
          id: 'operationSubType',
          header: 'Subtipo Operação',
          cell: (props) => (
            <span className='capitalize'>{props.getValue()}</span>
          ),
          enableColumnFilter: true,
          filterFn: 'arrIncludesSome'
        }
      ),
      columnHelper.accessor('movementDate', {
        header: 'Data',
        enableColumnFilter: false,
        cell: (props) =>
          format(new Date(props.getValue()), 'dd/MM/yyyy HH:mm:ss')
      }),
      columnHelper.accessor((row) => row.processedByUser?.name, {
        id: 'processedBy',
        size: 200,
        enableResizing: false,
        header: 'Processado Por',
        cell: (props) => (
          <div className='whitespace-normal'>{props.getValue() || 'N/A'}</div>
        )
      }),
      columnHelper.accessor((row) => row.collectedByWorker?.name, {
        id: 'collectedBy',
        header: 'Retirado Por',
        size: 200,
        enableResizing: false,
        cell: (props) => (
          <div className='whitespace-normal'>{props.getValue() || 'N/A'}</div>
        )
      }),
      columnHelper.accessor((row) => row.maintenanceRequest?.protocolNumber, {
        id: 'protocolNumberRMan',
        header: 'RMan',
        enableColumnFilter: false,
        cell: (props) => props.getValue() || 'N/A'
      }),
      columnHelper.accessor(
        (row) => row.materialRequestItem?.materialRequest?.protocolNumber,
        {
          id: 'protocolNumberRM',
          header: 'RM',
          enableColumnFilter: false,
          cell: (props) => props.getValue() || 'N/A'
        }
      ),

      columnHelper.accessor('quantity', {
        header: 'Qtd',
        size: 50,
        enableResizing: false,
        enableColumnFilter: false,
        cell: (props) => (
          <div className='text-right'>
            {Number(props.getValue()).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        )
      })
    ],
    []
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className='text-red-500'>
        Erro ao carregar extrato: {error?.message}
      </div>
    );
  }

  return (
    <div className='container mx-auto'>
      <SectionListHeaderSmall
        title={`Extrato do Material: ${statementData?.[0]?.globalMaterial?.name || globalMaterialId}`}
        subtitle={`Depósito: ${statementData?.[0]?.warehouse?.name || warehouseId}`}
        TitleIcon={Package}
      />

      <div className='mt-4'>
        <TableTanstackFaceted
          data={statementData || []}
          columns={columns}
          pagination={pagination}
          setPagination={setPagination}
          getRowClassName={getRowClassName} // Passa a função para estilizar as linhas
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
        />
      </div>
    </div>
  );
}
