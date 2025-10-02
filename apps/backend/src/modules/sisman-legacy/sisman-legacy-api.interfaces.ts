export interface SismanLegacyMaterialInItem {
  MaterialId: number;
  name: string;
  specification: string | null;
  unit: string;
  quantity: number;
  value: string;
}

export interface SismanLegacyMaterialIntype {
  id: number;
  type: string;
}

export interface SismanLegacyMaterialInResponseItem {
  id: number;
  materialIntypeId: number;
  userId: number;
  type: string;
  receivedBy: string;
  req: string;
  value: string;
  requiredBy: string;
  reqMaintenance: string;
  reqUnit: number;
  costUnit: number;
  costUnitSigla: string;
  costUnitNome: string;
  registerDate: string;
  created_at: string;
  updated_at: string;
  obs: string | null;
  MaterialInItems: SismanLegacyMaterialInItem[];
  MaterialIntype: SismanLegacyMaterialIntype;
  MaterialInFiles: any[]; // Assumindo que pode ser um array vazio ou de tipos variados
  invoice: string;
  returnId: number;
}

export interface SismanLegacyMaterialOutItem {
  value: string;
  quantity: number;
  MaterialId: number;
  MaterialOutId: number;
}

export interface SismanLegacyWorkerJobtype {
  id: number;
  job: string;
}

export interface SismanLegacyWorkerContract {
  start: string;
  end: string | null;
  located: string | null;
  unidadeId: number;
  obs: string | null;
  acting: string | null;
  workerId: number;
  ContractId: number;
  WorkerJobtypeId: number;
  WorkerContractDangerId: number | null;
  WorkerContractRegimeId: number;
  WorkerContractUnhealthyId: number | null;
  WorkerId: number;
  WorkerJobtype: SismanLegacyWorkerJobtype;
}

export interface SismanLegacyWorker {
  id?: number;
  name?: string;
  email?: string | null;
  birthdate?: string;
  filenamePhoto?: string | null;
  urlPhoto?: string;
  rg?: string | null;
  cpf?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  WorkerContracts?: SismanLegacyWorkerContract[];
}

export interface SismanLegacyMaterialOuttype {
  id?: number;
  type?: string;
}

export interface SismanLegacyMaterialOutResponseItem {
  id: number;
  materialOuttypeId: number;
  reqMaintenance: string;
  reqMaterial: string | null;
  userId: number;
  authorizedBy: number;
  workerId: number;
  campusId: number | null;
  propertyId: number | null;
  buildingId: number | null;
  place: string;
  obs: string | null;
  value: number;
  materialReserveId: number;
  userReplacementId: number | null;
  created_at: string;
  updated_at: string;
  type: string;
  userUsername: string;
  authorizerUsername: string;
  removedBy: string;
  valueBr: string;
  createdAtBr: string;
  updatedAtBr: string;
  MaterialOutFiles: any[];
  MaterialOutItems: SismanLegacyMaterialOutItem[];
  MaterialReturned: any[];
  Worker: SismanLegacyWorker;
  MaterialOuttype: SismanLegacyMaterialOuttype;
}

interface SismanLegacyWorkerManualfrequency {
  id: number;
  date: string;
  obs: string;
  ContractId: number;
  UnidadeId: number;
  UserId: number;
}

export interface SismanLegacyWorkerManualFrequencyResponse {
  hours: number;
  obs: string;
  WorkerId: number;
  WorkerManualfrequencyId: number;
  WorkerManualfrequencytypeId: number;
  WorkerManualfrequency: SismanLegacyWorkerManualfrequency;
}

export interface SismanLegacyMaterialReserveItem {
  quantity: number;
  value: number;
  MaterialId: number;
  MaterialReserveId: number;
}

export interface SismanLegacyMaterialReserve {
  id: number;
  reqMaintenance: string | null;
  reqMaterial: string | null;
  userId: number;
  authorizedBy: number;
  workerId: number;
  campusId: number | null;
  intendedUse: string;
  separatedAt: string | null;
  withdrawnAt: string | null;
  canceledAt: string | null;
  value: number;
  propertyId: number | null;
  buildingId: number | null;
  place: string;
  obs: string | null;
  created_at: string;
  UserId: number;
  WorkerId: number;
  MaterialReserveItems: SismanLegacyMaterialReserveItem[];
}

export type SismanLegacyMaterialReserveResponse =
  SismanLegacyMaterialReserve[];