import { Warehouse } from 'lucide-react';
import { WarehouseSelector } from './components/warehouse-selector';
import { TabSelector } from './components/tab-selector';

export default function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background min-h-screen'>
      {/* Secondary Navbar (Page-specific Header) */}
      <div className='border-primary-foreground/10 bg-primary/80 text-primary-foreground sticky top-0 z-10 border-b p-4 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Warehouse className='h-8 w-8' />
            <h1 className='text-2xl font-semibold'>
              Saída de Material de Depósito Provisório
            </h1>
          </div>
          <WarehouseSelector />
        </div>
      </div>

      <div className='mx-auto max-w-7xl space-y-6 p-4'>
        {/* Output Type Tabs */}
        <TabSelector />

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
