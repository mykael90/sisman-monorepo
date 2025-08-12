import { z } from 'zod';
import {
  IMaintenanceRequestAdd,
  IMaintenanceRequestEdit
} from '../../request-types';

export const maintenanceRequestFormSchemaAdd = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  deadline: z.date().optional(),
  facilityComplexId: z.string().optional(),
  buildingId: z.string().optional(),
  spaceId: z.number().optional(),
  systemId: z.number().optional(),
  local: z.string().optional(),
  serviceTypeId: z.number().optional(),
  assignedToId: z.number().optional()
}) satisfies z.ZodType<IMaintenanceRequestAdd>;

export const maintenanceRequestFormSchemaEdit =
  maintenanceRequestFormSchemaAdd.extend({
    id: z.number()
  }) satisfies z.ZodType<IMaintenanceRequestEdit>;
