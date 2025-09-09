'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MaterialOperationInKey,
  materialOperationInDisplayMap as op
} from '@/mappers/material-operations-mappers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TabSelectorProps {
  movementTypeCode: MaterialOperationInKey;
  setMovementTypeCode: React.Dispatch<
    React.SetStateAction<MaterialOperationInKey>
  >;
  handleReset: () => void;
}

export function TabSelector({
  movementTypeCode,
  setMovementTypeCode,
  handleReset
}: TabSelectorProps) {
  const tabs = [
    { value: op.IN_CENTRAL, label: 'Entrada Central' },
    { value: op.IN_PURCHASE, label: 'Compra' },
    { value: op.IN_DONATION, label: 'Doação' },
    { value: op.IN_TRANSFER, label: 'Transferência' },
    { value: op.IN_SERVICE_SURPLUS, label: 'Sobra de Serviço' },
    { value: op.IN_RETURN_FROM_ISSUE, label: 'Devolução' },
    { value: op.INITIAL_STOCK_LOAD, label: 'Carga Inicial' },
    { value: op.IN_LOAN_RETURN, label: 'Devolução Empréstimo' }
  ];

  const handleValueChange = (value: string) => {
    console.log(value);
    setMovementTypeCode(value as MaterialOperationInKey);
    handleReset();
  };

  return (
    <>
      <div id='tab-selector-desktop' className='hidden md:block'>
        <Tabs
          value={movementTypeCode || tabs[0].value}
          onValueChange={(value) =>
            handleValueChange(value as MaterialOperationInKey)
          }
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-8'>
            {' '}
            {/* Ajustado para 8 colunas */}
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div id='selector-mobile' className='block md:hidden'>
        <Select
          value={movementTypeCode || tabs[0].value}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className='bg-primary/80 w-full text-gray-200'>
            <SelectValue placeholder='Selecione um tipo de entrada' />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
