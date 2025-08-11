import { InfrastructureOccurrenceDiagnosis, Prisma } from '@sisman/prisma';

export type IOccurrenceDiagnosisWithRelations = Prisma.InfrastructureOccurrenceDiagnosisGetPayload<{
  include: {occurrence:true,analyzedBy:true,maintenanceRequest:true,associatedRisks:true}
}>;

export interface IOccurrenceDiagnosisAdd extends Omit<Prisma.InfrastructureOccurrenceDiagnosisCreateInput, 
  'occurrence' | 'analyzedBy' | 'maintenanceRequest' | 'associatedRisks'
> {}

export interface IOccurrenceDiagnosisEdit extends IOccurrenceDiagnosisAdd {
  id: number;
}

export type IOccurrenceDiagnosis = InfrastructureOccurrenceDiagnosis;

export type IOccurrenceDiagnosisRemove = {
  id: number;
};

export type IOccurrenceDiagnosisSelect = Prisma.InfrastructureOccurrenceDiagnosisSelect;

export type IOccurrenceDiagnosisRelatedData = {
  // Will be added later
};
