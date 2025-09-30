import {
  Worker,
  WorkerTeam,
  WorkerSpecialty,
  WorkerContract,
  Prisma
} from '@sisman/prisma';
import { IMaintenanceInstance } from '../maintenance/instance/instance-types';
import { IContractWithRelations } from '../contract/contract-types'; // Alterado para IContractWithRelations
import { ISipacUnidadeWithRelations } from '../sipac/unidade/unidade-types'; // Alterado para ISipacUnidadeWithRelations

export enum WorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VACATION = 'VACATION',
  LEAVE = 'LEAVE'
}

export type IWorkerWithRelations = Prisma.WorkerGetPayload<{
  include: {
    workerContracts: {
      include: {
        contract: {
          include: {
            providers: true;
          };
        };
        workerSpecialty: true;
        sipacUnitLocation: true;
      };
    };
    maintenanceInstance: true;
    ledTeam: true;
    teams: true;
    workAllocations: true;
    pickingOrdersBeCollected: true;
    withdrawalsCollected: true;
    materialStockMovementsCollected: true;
  };
}>;

export interface IWorkerAdd extends Prisma.WorkerCreateManyInput {
  workerContracts?: Record<'id', number>[];
}

export interface IWorkerEdit extends IWorkerAdd {
  id: number;
  isActive: boolean;
}

export type IWorker = Worker;

export type IWorkerRemove = {
  id: string;
};

export type IWorkerSelect = Prisma.WorkerSelect;

export type IWorkerRelatedData = {
  listMaintenanceInstances: IMaintenanceInstance[];
  listContracts: IContractWithRelations[]; // Alterado para IContractWithRelations
  listWorkerSpecialties: IWorkerSpecialty[];
  listSipacUnidades: ISipacUnidadeWithRelations[]; // Alterado para ISipacUnidadeWithRelations
};

export type IWorkerTeamWithRelations = Prisma.WorkerTeamGetPayload<{
  include: {
    specialty: true;
    leader: true;
    members: true;
    serviceOrders: true;
  };
}>;

export interface IWorkerTeamAdd extends Prisma.WorkerTeamCreateManyInput {
  specialty: Record<'id', number>;
  leader?: Record<'id', number>;
  members?: Record<'id', number>[];
}

export interface IWorkerTeamEdit extends IWorkerTeamAdd {
  id: number;
  isActive: boolean;
}

export type IWorkerTeam = WorkerTeam;

export type IWorkerTeamRemove = {
  id: string;
};

export type IWorkerTeamSelect = Prisma.WorkerTeamSelect;

export type IWorkerSpecialtyWithRelations = Prisma.WorkerSpecialtyGetPayload<{
  include: {
    teams: true;
    workerContracts: true;
  };
}>;

export interface IWorkerSpecialtyAdd
  extends Prisma.WorkerSpecialtyCreateManyInput {}

export interface IWorkerSpecialtyEdit extends IWorkerSpecialtyAdd {
  id: number;
}

export type IWorkerSpecialty = WorkerSpecialty;

export type IWorkerSpecialtyRemove = {
  id: string;
};

export type IWorkerSpecialtySelect = Prisma.WorkerSpecialtySelect;

export type IWorkerContractWithRelations = Prisma.WorkerContractGetPayload<{
  include: {
    worker: true;
    contract: true;
    workerSpecialty: true;
    sipacUnitLocation: true;
  };
}>;

export interface IWorkerContractAdd
  extends Prisma.WorkerContractCreateManyInput {
  worker: Record<'id', number>;
  contract: Record<'id', number>;
  workerSpecialty: Record<'id', number>;
  sipacUnitLocation: Record<'id', number>;
}

export interface IWorkerContractEdit extends IWorkerContractAdd {
  id: number;
}

export type IWorkerContract = WorkerContract;

export type IWorkerContractRemove = {
  id: string;
};

export type IWorkerContractSelect = Prisma.WorkerContractSelect;
