import type React from 'react';
import {
  Inbox,
  PauseCircle,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function MaintenanceStats() {
  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-gray-800'>
          Estatísticas de Solicitações de Manutenção
        </h2>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Ano:</span>
          <Select defaultValue='2025'>
            <SelectTrigger className='w-24'>
              <SelectValue placeholder='Selecionar ano' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2023'>2023</SelectItem>
              <SelectItem value='2024'>2024</SelectItem>
              <SelectItem value='2025'>2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-5 gap-4'>
        <StatCard
          icon={
            <Inbox className='text-sisman-green dark:text-sisman-green h-8 w-8' />
          }
          value='245'
          label='Recebidas'
        />
        <StatCard
          icon={
            <PauseCircle className='text-sisman-yellow dark:text-sisman-yellow h-8 w-8' />
          }
          value='32'
          label='Em Espera'
        />
        <StatCard
          icon={
            <Settings className='text-sisman-blue dark:text-sisman-blue h-8 w-8' />
          }
          value='58'
          label='Em Atendimento'
        />
        <StatCard
          icon={
            <CheckCircle className='text-sisman-green dark:text-sisman-green h-8 w-8' />
          }
          value='142'
          label='Atendidas'
        />
        <StatCard
          icon={
            <XCircle className='text-sisman-red dark:text-sisman-red h-8 w-8' />
          }
          value='13'
          label='Não Atendidas'
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className='flex flex-col items-center rounded-lg border bg-white p-4 dark:border-gray-600 dark:bg-gray-800'>
      {icon}
      <span className='mt-2 text-2xl font-bold'>{value}</span>
      <span className='text-sm text-gray-500'>{label}</span>
    </div>
  );
}
