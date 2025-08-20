'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { materialOperationOutDisplayMap as op } from '../../../../../../mappers/material-operations-mappers';

export function TabSelector() {
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop(); // Get the last segment of the URL

  return (
    <Tabs value={activeTab} className='w-full'>
      <TabsList className='grid w-full grid-cols-5'>
        <TabsTrigger value={op.OUT_SERVICE_USAGE} asChild>
          <Link href={`/material/withdrawal/${op.OUT_SERVICE_USAGE}`}>
            Uso Serviço
          </Link>
        </TabsTrigger>
        <TabsTrigger value={op.OUT_DISPOSAL_DAMAGE} asChild>
          <Link href={`/material/withdrawal/${op.OUT_DISPOSAL_DAMAGE}`}>
            Descarte
          </Link>
        </TabsTrigger>
        <TabsTrigger value={op.OUT_DONATION} asChild>
          <Link href={`/material/withdrawal/${op.OUT_DONATION}`}>Doação</Link>
        </TabsTrigger>
        <TabsTrigger value={op.OUT_EXPIRATION} asChild>
          <Link href={`/material/withdrawal/${op.OUT_EXPIRATION}`}>
            Vencimento
          </Link>
        </TabsTrigger>
        <TabsTrigger value={op.OUT_TRANSFER} asChild>
          <Link href={`/material/withdrawal/${op.OUT_TRANSFER}`}>
            Transferência
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
