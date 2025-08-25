'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { materialOperationOutDisplayMap as op } from '@/mappers/material-operations-mappers';
import { useMediaQuery } from '@/hooks/use-media-query';

export function TabSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = pathname.split('/').pop(); // Get the last segment of the URL
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const tabs = [
    { value: op.OUT_SERVICE_USAGE, label: 'Uso Serviço' },
    { value: op.OUT_DISPOSAL_DAMAGE, label: 'Descarte' },
    { value: op.OUT_DONATION, label: 'Doação' },
    { value: op.OUT_EXPIRATION, label: 'Vencimento' },
    { value: op.OUT_TRANSFER, label: 'Transferência' }
  ];

  const handleValueChange = (value: string) => {
    router.push(`/material/withdrawal/${value}`);
  };

  if (isDesktop) {
    return (
      <Tabs value={activeTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={`/material/withdrawal/${tab.value}`}>
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Select value={activeTab} onValueChange={handleValueChange}>
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
