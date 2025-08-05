import { Warehouse, Prisma } from '@sisman/prisma';

// Interface para listar warehouses
export type IWarehouseList = Pick<
  Warehouse,
  'id' | 'name' | 'code' | 'location' | 'isActive' | 'updatedAt'
>;

// Interface para dados completos de um warehouse (pode ser igual a Warehouse)
export type IWarehouse = Warehouse;

// Interface para adicionar um novo warehouse
export interface IWarehouseAdd {
  name: string;
  code?: string | null;
  location?: string | null;
  isActive?: boolean;
  maintenanceInstanceId: number;
}

// Interface para editar um warehouse
export interface IWarehouseEdit extends IWarehouseAdd {
  id: number;
}
