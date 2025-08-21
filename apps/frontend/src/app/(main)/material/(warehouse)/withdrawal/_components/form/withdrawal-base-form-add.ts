import { IActionResultForm } from '@/types/types-server-actions';
import { IMaterialGlobalCatalogAdd } from '../../../../global-catalog/material-global-catalog-types';
import {
  IMaterialWithdrawalAdd,
  IMaterialWithdrawalItemAdd
} from '../../withdrawal-types';

export type IMaterialWithdrawalItemAddForm =
  Partial<IMaterialWithdrawalItemAdd> &
    Omit<IMaterialGlobalCatalogAdd, 'id' | 'materialWithdrawalId'> & {
      key: number;
      freeBalanceQuantity: number;
      physicalOnHandQuantity: number;
    };

export interface IMaterialWithdrawalAddForm extends IMaterialWithdrawalAdd {
  items: IMaterialWithdrawalItemAddForm[];
  collectorType: string;
}

export const fieldsLabelsWithdrawalForm: Partial<
  Record<keyof IMaterialWithdrawalAddForm, string>
> = {
  collectedByUserId: 'Coletado pelo usuário',
  withdrawalNumber: 'Número da Retirada',
  withdrawalDate: 'Data da Retirada',
  maintenanceRequestId: 'Requisição de Manutenção',
  warehouseId: 'Depósito',
  processedByUserId: 'Processado por',
  movementTypeId: 'Tipo de Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'Coletado por'
};

export const initialServerStateWithdrawal: IActionResultForm<IMaterialWithdrawalAddForm> =
  {
    isSubmitSuccessful: false,
    message: ''
  };
