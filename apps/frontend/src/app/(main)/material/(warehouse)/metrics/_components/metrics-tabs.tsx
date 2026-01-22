import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, HardHat, User2, Package2Icon } from 'lucide-react';
import Link from 'next/link';

export function MetricsTabs() {
  return (
    <Tabs defaultValue='movements' className='space-y-4'>
      {/* Lista de Navegação (Abas) */}
      <TabsList className='grid h-auto w-full grid-cols-1 md:grid-cols-4'>
        <Link
          href={'/material/metrics/movements'}
          className='flex items-center gap-2'
        >
          <TabsTrigger
            value='movements'
            className='flex items-center gap-2 py-2'
          >
            <Package className='h-4 w-4' />
            <span className='truncate'>Movimentos </span>
          </TabsTrigger>
        </Link>

        <Link href={'workers'} className='flex items-center gap-2'>
          <TabsTrigger
            value='/material/metrics/workers'
            className='flex items-center gap-2 py-2'
          >
            <HardHat className='h-4 w-4' />
            <span className='truncate'>Profissionais </span>
          </TabsTrigger>
        </Link>

        <Link href={'users'} className='flex items-center gap-2'>
          <TabsTrigger
            value='/material/metrics/users'
            className='flex items-center gap-2 py-2'
          >
            <User2 className='h-4 w-4' />
            <span className='truncate'>Usuarios </span>
          </TabsTrigger>
        </Link>

        <Link href={'stock'} className='flex items-center gap-2'>
          <TabsTrigger
            value='/material/metrics/stock'
            className='flex items-center gap-2 py-2'
          >
            <Package2Icon className='h-4 w-4 -scale-x-100' />
            <span className='truncate'>Inventário </span>
          </TabsTrigger>
        </Link>
      </TabsList>

      {/* Conteúdo: Itens da Requisição */}
      {/* <TabsContent value='movements' className='space-y-4 outline-none'>
        <div>Nada por enquanto aqui1</div>
      </TabsContent> */}

      {/* Conteúdo: Entradas (Receipts) */}
      {/* <TabsContent value='workers' className='space-y-4 outline-none'>
        <div>Nada por enquanto aqui2</div>
      </TabsContent> */}

      {/* Conteúdo: Reservas (Picking Orders) */}
      {/* <TabsContent value='users' className='space-y-4 outline-none'>
        <div>Nada por enquanto aqui3</div>
      </TabsContent> */}

      {/* Conteúdo: Saídas (Withdrawals) */}
      {/* <TabsContent value='stock' className='space-y-4 outline-none'>
        <div>Nada por enquanto aqui4</div>
      </TabsContent> */}

      {/* Conteúdo: Restrições */}
      {/* <TabsContent value='restrictions' className='space-y-4 outline-none'>
        <div>Nada por enquanto aqui5</div>
      </TabsContent> */}
    </Tabs>
  );
}
