import { MaintenanceTimelineEvent, Prisma } from '@sisman/prisma';

export type ITimelineEventWithRelations = Prisma.MaintenanceTimelineEventGetPayload<{
  include: {maintenanceRequest:true,actionBy:true,transferredFromInstance:true,transferredToInstance:true}
}>;

export interface ITimelineEventAdd extends Omit<Prisma.MaintenanceTimelineEventCreateInput, 
  'maintenanceRequest' | 'actionBy' | 'transferredFromInstance' | 'transferredToInstance'
> {}

export interface ITimelineEventEdit extends ITimelineEventAdd {
  id: number;
}

export type ITimelineEvent = MaintenanceTimelineEvent;

export type ITimelineEventRemove = {
  id: number;
};

export type ITimelineEventSelect = Prisma.MaintenanceTimelineEventSelect;

export type ITimelineEventRelatedData = {
  // Will be added later
};
