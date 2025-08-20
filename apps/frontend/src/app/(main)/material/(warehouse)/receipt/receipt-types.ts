import { MaterialReceipt, Prisma } from '@sisman/prisma';

export type IReceiptWithRelations = Prisma.MaterialReceiptGetPayload<{
  include: {}
}>;

export interface IReceiptAdd extends Omit<Prisma.MaterialReceiptCreateInput, 
  
> {}

export interface IReceiptEdit extends IReceiptAdd {
  id: number;
}

export type IReceipt = MaterialReceipt;

export type IReceiptRemove = {
  id: number;
};

export type IReceiptSelect = Prisma.MaterialReceiptSelect;

export type IReceiptRelatedData = {
  // Will be added later
};
