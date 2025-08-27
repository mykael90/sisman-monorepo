import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function RecentRequests() {
  return (
    <div>
      <h2 className='mb-6 text-xl font-bold text-gray-800'>
        Solicitações de Manutenção Recentes
      </h2>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b text-left text-sm text-gray-500'>
              <th className='pb-2 font-medium'>Nº da Solicitação</th>
              <th className='pb-2 font-medium'>Infraestrutura</th>
              <th className='pb-2 font-medium'>Solicitante</th>
              <th className='pb-2 font-medium'>Técnico</th>
              <th className='pb-2 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-b'>
              <td className='py-4 text-sm'>#12345</td>
              <td className='py-4 text-sm'>Escritório Central - Andar 3</td>
              <td className='py-4'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage src='/placeholder.svg?height=24&width=24' />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className='text-sm'>Sarah Connor</span>
                </div>
              </td>
              <td className='py-4'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage src='/placeholder.svg?height=24&width=24' />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span className='text-sm'>John Smith</span>
                </div>
              </td>
              <td className='py-4'>
                <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                  <span className='mr-1 h-1.5 w-1.5 rounded-full bg-green-500'></span>
                  Concluído
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='mt-4 text-center'>
        <Button variant='ghost' className='text-gray-500'>
          Carregar Mais Solicitações <ChevronDown className='ml-1 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
