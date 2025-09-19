'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MaterialOperationInKey,
  materialOperationInDisplayMap as op
} from '@/mappers/material-operations-mappers';
import { materialOperationInDisplayMapPorguguese as opPt } from '@/mappers/material-operations-mappers-translate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { InfoHoverCard } from '../../../../../../../components/info-hover-card';

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
    { value: op.IN_CENTRAL, label: opPt[op.IN_CENTRAL] },
    { value: op.IN_SERVICE_SURPLUS, label: opPt[op.IN_SERVICE_SURPLUS] },
    { value: op.IN_PURCHASE, label: opPt[op.IN_PURCHASE] },
    { value: op.IN_DONATION, label: opPt[op.IN_DONATION] },
    { value: op.IN_TRANSFER, label: opPt[op.IN_TRANSFER] },
    { value: op.IN_RETURN_FROM_ISSUE, label: opPt[op.IN_RETURN_FROM_ISSUE] },
    // { value: op.INITIAL_STOCK_LOAD, label: 'Carga Inicial' },
    { value: op.IN_LOAN_RETURN, label: opPt[op.IN_LOAN_RETURN] }
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
          <TabsList className='grid w-full grid-cols-7'>
            {' '}
            {/* Ajustado para 8 colunas */}
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} about='teste'>
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
