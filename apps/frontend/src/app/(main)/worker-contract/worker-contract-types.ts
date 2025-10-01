import { WorkerContract, Prisma } from '@sisman/prisma';
import { IWorkerSpecialty } from '../worker/worker-types';
import { IContractWithRelations } from '../contract/contract-types';
import { ISipacUnidadeWithRelations } from '../sipac/unidade/unidade-types';

export type IWorkerContractWithRelations = Prisma.WorkerContractGetPayload<{
  include: {
    contract: {
      include: {
        providers: true;
      };
    };
    worker: true;
  };
}>;

export interface IWorkerContractAdd
  extends Prisma.WorkerContractCreateManyInput {
  sipacUnitLocationCode: string;
}

export interface IWorkerContractEdit extends IWorkerContractAdd {
  id: number;
}

export type IWorkerContract = WorkerContract;

export type IWorkerContractRemove = {
  id: string;
};

export type IWorkerContractRelatedData = {
  listSpecialities: IWorkerSpecialty[];
  listContracts: IContractWithRelations[];
};
