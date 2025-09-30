'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertModal } from '@/components/modals/alert-modal'; // Será criado em seguida
import { IWorkerSpecialtyWithRelations } from '../../worker-specialty-types';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import Logger from '@/lib/logger';
import { getRefreshedWorkerSpecialties } from '../../worker-specialty-actions';

interface CellActionProps {
  data: IWorkerSpecialtyWithRelations;
}

const logger = new Logger('worker-specialty-cell-action');
const API_RELATIVE_PATH = '/worker-specialty';

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: 'ID copiado!',
      description:
        'O ID da especialidade de trabalhador foi copiado para a área de transferência.'
    });
  };

  const onDelete = async () => {
    try {
      startTransition(async () => {
        const accessToken = await getSismanAccessToken();
        await fetchApiSisman(`${API_RELATIVE_PATH}/${data.id}`, accessToken, {
          method: 'DELETE'
        });
        await getRefreshedWorkerSpecialties();
        toast({
          title: 'Especialidade de trabalhador excluída!',
          description:
            'A especialidade de trabalhador foi removida com sucesso.'
        });
        setOpen(false);
      });
    } catch (error) {
      logger.error(
        `(Cell Action) onDelete: Erro ao excluir especialidade de trabalhador ${data.id}.`,
        error
      );
      toast({
        title: 'Erro ao excluir!',
        description:
          'Ocorreu um erro ao tentar excluir a especialidade de trabalhador. Verifique se não há dependências.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Abrir menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id.toString())}>
            <Copy className='mr-2 h-4 w-4' /> Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/worker-specialty/edit/${data.id}`)}
          >
            <Edit className='mr-2 h-4 w-4' /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
