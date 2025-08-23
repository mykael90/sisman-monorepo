import { FieldApi } from '@tanstack/react-form';
import Logger from '../../../../../../../lib/logger';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalItemAddForm
} from '../../withdrawal-types';
import {
  IItemWithdrawalMaterialRequestForm,
  IMaterialRequestBalanceWithRelationsForm
} from '../card-material-link-details';
import { TableFormItemsMaterialRequest } from './table-form-items-material-request';

const logger = new Logger(`material-items-material-request-field`);

interface MaterialItemsMaterialRequestFieldProps {
  field: FieldApi<
    IMaterialWithdrawalAddForm,
    'items',
    IMaterialWithdrawalItemAddForm[],
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  materialRequestBalance: IMaterialRequestBalanceWithRelationsForm | null;
}

export function MaterialItemsMaterialRequestField({
  field,
  materialRequestBalance
}: MaterialItemsMaterialRequestFieldProps) {
  const handleRemoveMaterial = (key: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddForm) => m.key === key
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (key: number, quantity: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddForm) => m.key === key
    );
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        quantityWithdrawn: quantity
      };
      field.replaceValue(index, updatedMaterial);
    }
  };
  return (
    <TableFormItemsMaterialRequest
      materialsInfo={
        materialRequestBalance?.itemsBalance.map(
          (item: IItemWithdrawalMaterialRequestForm) => ({
            ...item,
            quantityFreeBalancePotential: Number(
              item.quantityFreeBalancePotential
            ),
            quantityRequested: Number(item.quantityRequested),
            quantityApproved: Number(item.quantityApproved),
            quantityReceivedSum: Number(item.quantityReceivedSum),
            quantityWithdrawnSum: Number(item.quantityWithdrawnSum),
            quantityReserved: Number(item.quantityReserved),
            quantityRestricted: Number(item.quantityRestricted),
            quantityFreeBalanceEffective: Number(
              item.quantityFreeBalanceEffective
            )
          })
        ) as IItemWithdrawalMaterialRequestForm[]
      }
      materials={field.state.value}
      onRemove={handleRemoveMaterial} // No remove action for linked items
      onUpdateQuantity={handleUpdateQuantity} // No quantity update for linked items
      readOnly={false} // Make quantity editable for linked items
    />
  );
}
