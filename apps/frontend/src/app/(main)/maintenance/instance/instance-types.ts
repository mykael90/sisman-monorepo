import { MaintenanceInstance, Prisma } from '@sisman/prisma';

// Interface para listar instâncias de manutenção
export type IMaintenanceInstance = MaintenanceInstance;

// Interface para adicionar uma nova instância de manutenção
export interface IMaintenanceInstanceAdd
  extends Prisma.MaintenanceInstanceCreateManyInput {}

// Interface para editar uma instância de manutenção
export interface IMaintenanceInstanceEdit extends IMaintenanceInstanceAdd {}

// Interface para dados completos de uma instância de manutenção com relações
export type IMaintenanceInstanceWithRelations =
  Prisma.MaintenanceInstanceGetPayload<{
    include: {
      currentMaintenanceRequests: true;
      warehouses: true;
    };
  }>;
