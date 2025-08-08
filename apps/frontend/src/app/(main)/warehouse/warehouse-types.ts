import { Prisma, Warehouse } from '@sisman/prisma';

// Interface para dados completos de um warehouse (pode ser igual a Warehouse)
export type IWarehouse = Warehouse;

// Interface para adicionar um novo warehouse
export interface IWarehouseAdd extends Prisma.WarehouseCreateManyInput {}

// Interface para editar um warehouse
export interface IWarehouseEdit extends IWarehouseAdd {}
