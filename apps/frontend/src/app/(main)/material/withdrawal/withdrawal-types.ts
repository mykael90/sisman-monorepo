import { MaterialWithdrawal, Prisma } from '@sisman/prisma';

export type IWithdrawalWithRelations = Prisma.MaterialWithdrawalGetPayload<{
  include: {maintenanceRequest:true}
}>;

export interface IWithdrawalAdd extends Omit<Prisma.MaterialWithdrawalCreateInput, 
  'maintenanceRequest'
> {}

export interface IWithdrawalEdit extends IWithdrawalAdd {
  id: number;
}

export type IWithdrawal = MaterialWithdrawal;

export type IWithdrawalRemove = {
  id: number;
};

export type IWithdrawalSelect = Prisma.MaterialWithdrawalSelect;

export type IWithdrawalRelatedData = {
  // Will be added later
};
