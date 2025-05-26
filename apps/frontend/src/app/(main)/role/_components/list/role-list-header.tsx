'use client';

import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react'; // Usando Shield como ícone para Role

interface RoleListHeaderProps {
  onAddRole: () => void;
}

export function RoleListHeader({ onAddRole }: RoleListHeaderProps) {
  return (
    <div className='flex flex-col items-center justify-between sm:flex-row'>
      <div>
        <h1 className='text-2xl font-bold'>Gerenciamento de Papéis</h1>
        <p className='text-muted-foreground'>
          Gerenciar papéis e permissões do sistema
        </p>
      </div>
      <div className='flex place-self-end py-2'>
        <Button variant={'default'} onClick={onAddRole}>
          <Shield className='mr-2 h-4 w-4' /> {/* Ícone Shield */}
          Adicionar Novo Papel
        </Button>
      </div>
    </div>
  );
}
