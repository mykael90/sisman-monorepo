import { Prisma } from '@sisman/prisma';

// Interface para listar instâncias de manutenção
export type IMaintenanceInstanceList = Prisma.MaintenanceInstanceGetPayload<{
  select: {
    id: true;
    name: true;
    isActive: true;
    sipacId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// Interface para adicionar uma nova instância de manutenção
export interface IMaintenanceInstanceAdd
  extends Prisma.MaintenanceInstanceCreateManyInput {}

// Interface para editar uma instância de manutenção
export interface IMaintenanceInstanceEdit extends IMaintenanceInstanceAdd {
  id: number;
}

// Interface para dados completos de uma instância de manutenção com relações
export type IMaintenanceInstanceWithRelations =
  Prisma.MaintenanceInstanceGetPayload<{
    include: {
      currentMaintenanceRequests: true;
      warehouses: true;
    };
  }>;
