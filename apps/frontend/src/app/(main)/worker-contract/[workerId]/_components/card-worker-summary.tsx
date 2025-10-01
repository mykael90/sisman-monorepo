'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Briefcase, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IWorker } from '../../../worker/worker-types';

export function CardWorkerSummary({ worker }: { worker: IWorker }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações do Colaborador</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Nome Completo</Label>
            <p className='text-muted-foreground'>{worker.name}</p>
          </div>
          <div className='space-y-2'>
            <Label>CPF</Label>
            <p className='text-muted-foreground'>{worker.cpf}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Email</Label>
            <p className='text-muted-foreground'>
              {worker.email || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Telefone</Label>
            <p className='text-muted-foreground'>
              {worker.phone || 'Não informado'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
