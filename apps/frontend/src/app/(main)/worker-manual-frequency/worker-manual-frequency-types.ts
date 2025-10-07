import {
  WorkerManualFrequency,
  WorkerManualFrequencyType,
  Prisma
} from '@sisman/prisma';
import { IWorker } from '../worker/worker-types';
import { IUser } from '../user/user-types';

export type IWorkerManualFrequencyWithRelations =
  Prisma.WorkerManualFrequencyGetPayload<{
    include: {
      // Peça ao Prisma para incluir o WorkerContract relacionado.
      // Ele usará a relação `workerContract` que você definiu no schema.
      workerContract: {
        include: {
          sipacUnitLocation: {
            select: { codigoUnidade: true; sigla: true };
          };
          contract: { select: { codigoSipac: true; subject: true } };
          workerSpecialty: {
            select: {
              name: true;
            };
          };
        };
      };

      // Você também pode incluir outros dados relacionados, se precisar.
      worker: {
        select: {
          name: true; // Exemplo: selecionando apenas o nome do trabalhador
        };
      };
      workerManualFrequencyType: true;
      user: true;
    };
  }>;

export interface IWorkerManualFrequencyAdd
  extends Prisma.WorkerManualFrequencyUncheckedCreateInput {}

export interface IWorkerManualFrequencyEdit extends IWorkerManualFrequencyAdd {
  id: number;
}

export type IWorkerManualFrequency = WorkerManualFrequency;

export type IWorkerManualFrequencyRemove = {
  id: string;
};

export type IWorkerManualFrequencySelect = Prisma.WorkerManualFrequencySelect;

export type IWorkerManualFrequencyRelatedData = {
  listWorkers: IWorker[];
  listWorkerManualFrequencyTypes: IWorkerManualFrequencyType[];
  listUsers: IUser[]; // Temporariamente removido devido a erro de importação
};

export type IWorkerManualFrequencyTypeWithRelations =
  Prisma.WorkerManualFrequencyTypeGetPayload<{
    include: {
      workerManualFrequency: true;
    };
  }>;

export interface IWorkerManualFrequencyTypeAdd
  extends Prisma.WorkerManualFrequencyTypeCreateManyInput {}

export interface IWorkerManualFrequencyTypeEdit
  extends IWorkerManualFrequencyTypeAdd {
  id: number;
}

export type IWorkerManualFrequencyType = WorkerManualFrequencyType;

export type IWorkerManualFrequencyTypeRemove = {
  id: string;
};

export type IWorkerManualFrequencyTypeSelect =
  Prisma.WorkerManualFrequencyTypeSelect;
