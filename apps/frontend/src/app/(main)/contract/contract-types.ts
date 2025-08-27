import { Contract, Prisma } from '@sisman/prisma';
import { IContractProvider } from '../contract-provider/contract-provider-types';

export type IContractWithRelations = Prisma.ContractGetPayload<{
  include: {
    providers: true;
    workersContracts: true;
  };
}>;

export interface IContractAdd extends Prisma.ContractCreateManyInput {
  providers: Record<'id', number>;
}

export type IContractRelatedData = {
  listContractProviders: IContractProvider[];
};

export interface IContractEdit extends IContractAdd {
  id: number;
  isActive: boolean;
}

export type IContract = Contract;

export type IContractRemove = {
  id: string;
};

export type IContractSelect = Prisma.ContractSelect;
