import { ContractProvider, Prisma } from '@sisman/prisma';

export type IContractProviderWithRelations = Prisma.ContractProviderGetPayload<{
  include: {
    contracts: true;
  };
}>;

export interface IContractProviderAdd
  extends Prisma.ContractProviderCreateManyInput {}

export interface IContractProviderEdit extends IContractProviderAdd {
  id: number;
}

export type IContractProvider = ContractProvider;

export type IContractProviderRemove = {
  id: string;
};

export type IContractProviderSelect = Prisma.ContractProviderSelect;
