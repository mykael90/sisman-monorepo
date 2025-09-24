export interface SismanLegacyMaterialInItem {
  materialId: number;
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
  createdAt: string;
  updatedAt: string;
  obs: string | null;
  MaterialInItems: SismanLegacyMaterialInItem[];
  MaterialIntype: SismanLegacyMaterialIntype;
  MaterialInFiles: any[]; // Assumindo que pode ser um array vazio ou de tipos variados
  invoice: string;
  returnId: number;
}
