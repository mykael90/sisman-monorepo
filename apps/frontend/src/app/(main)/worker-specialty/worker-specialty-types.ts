import { WorkerSpecialty, Prisma } from '@sisman/prisma';

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
