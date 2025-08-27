import {
  Worker,
  WorkerTeam,
  WorkerSpecialty,
  WorkerContract,
  Prisma
} from '@sisman/prisma';
import { IMaintenanceInstance } from '../maintenance/instance/instance-types';
import { IContract } from '../contract/contract-types';
import { ISipacUnidade } from '../sipac/unidade/unidade-types';

export type IWorkerWithRelations = Prisma.WorkerGetPayload<{
  include: {
    workerContracts: true;
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
  listContracts: IContract[];
  listWorkerSpecialties: IWorkerSpecialty[];
  listSipacUnidades: ISipacUnidade[];
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
