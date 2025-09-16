'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import Loading from '@/components/loading';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { PaginationState, Row } from '@tanstack/react-table';
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
        return 'hover:bg-accent/10 odd:bg-white even:bg-gray-50';
    }
  };

  const columns: ColumnDef<IMaterialStatement, any>[] = [
    columnHelper.accessor((row) => row.movementType.operation, {
      id: 'operationType',
      header: 'Tipo Operação',
      cell: (props) => {
        const operation = props.getValue() as TMaterialOperationTypeKey;
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
            {materialOperationTypeDisplayMapPortuguese[operation] ||
              operation.replace('_', ' ')}
          </Badge>
        );
      }
    }),
    columnHelper.accessor((row) => row.movementType.code, {
      id: 'operationSubType',
      header: 'Subtipo Operação',
      cell: (props) => {
        const operationCode = props.getValue();
        const operationType = props.row.original.movementType.operation;
        let translatedText = operationCode;

        switch (operationType) {
          case 'IN':
            translatedText =
              materialOperationInDisplayMapPorguguese[
                operationCode as TMaterialOperationInKey
              ] || operationCode;
            break;
          case 'OUT':
            translatedText =
              materialOperationOutDisplayMapPorguguese[
                operationCode as TMaterialOperationOutKey
              ] || operationCode;
            break;
          case 'ADJUSTMENT':
            translatedText =
              materialOperationAdjustmentDisplayMapPorguguese[
                operationCode as TMaterialOperationAdjustmentKey
              ] || operationCode;
            break;
          case 'RESERVATION':
            translatedText =
              materialOperationReservationDisplayMapPorguguese[
                operationCode as TMaterialOperationReservationKey
              ] || operationCode;
            break;
          case 'RESTRICTION':
            translatedText =
              materialOperationRestrictionDisplayMapPorguguese[
                operationCode as TMaterialOperationRestrictionKey
              ] || operationCode;
            break;
          default:
            translatedText = operationCode.replace(/_/g, ' ').toLowerCase();
        }

        return <span className='capitalize'>{translatedText}</span>;
      }
    }),
    columnHelper.accessor('movementDate', {
      header: 'Data',
      cell: (props) => format(new Date(props.getValue()), 'dd/MM/yyyy HH:mm:ss')
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
      cell: (props) => props.getValue() || 'N/A'
    }),
    columnHelper.accessor(
      (row) => row.materialRequestItem?.materialRequest?.protocolNumber,
      {
        id: 'protocolNumberRM',
        header: 'RM',
        cell: (props) => props.getValue() || 'N/A'
      }
    ),

    columnHelper.accessor('quantity', {
      header: 'Qtd',
      size: 50,
      enableResizing: false,
      cell: (props) => (
        <div className='text-right'>
          {Number(props.getValue()).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      )
    })
  ];

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
        <TableTanstack
          data={statementData || []}
          columns={columns}
          pagination={pagination}
          setPagination={setPagination}
          getRowClassName={getRowClassName} // Passa a função para estilizar as linhas
        />
      </div>
    </div>
  );
}
