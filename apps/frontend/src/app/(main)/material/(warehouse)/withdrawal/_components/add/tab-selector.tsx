'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MaterialOperationOutKey,
  materialOperationOutDisplayMap as op
} from '@/mappers/material-operations-mappers';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@radix-ui/react-select';

interface TabSelectorProps {
  movementTypeCode: MaterialOperationOutKey;
  setMovementTypeCode: React.Dispatch<
    React.SetStateAction<MaterialOperationOutKey>
  >;
  handleReset: () => void;
}

export function TabSelector({
  movementTypeCode,
  setMovementTypeCode,
  handleReset
}: TabSelectorProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const tabs = [
    { value: op.OUT_SERVICE_USAGE, label: 'Uso Serviço' },
    { value: op.OUT_DISPOSAL_DAMAGE, label: 'Descarte' },
    { value: op.OUT_DONATION, label: 'Doação' },
    { value: op.OUT_EXPIRATION, label: 'Vencimento' },
    { value: op.OUT_TRANSFER, label: 'Transferência' }
  ];

  const handleValueChange = (value: string) => {
    console.log(value);
    setMovementTypeCode(value as MaterialOperationOutKey);
    handleReset();
  };

  if (isDesktop) {
    return (
      <Tabs
        value={movementTypeCode || tabs[0].value}
        onValueChange={(value) =>
          handleValueChange(value as MaterialOperationOutKey)
        }
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-5'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Select
      value={movementTypeCode || tabs[0].value}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className='bg-primary/80 w-full text-gray-200'>
        <SelectValue placeholder='Selecione um tipo de retirada' />
      </SelectTrigger>
      <SelectContent>
        {tabs.map((tab) => (
          <SelectItem key={tab.value} value={tab.value}>
            {tab.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
