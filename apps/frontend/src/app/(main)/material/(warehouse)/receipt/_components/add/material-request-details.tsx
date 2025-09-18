import { Label } from '@/components/ui/label';
import { statusMaterialRequestDisplayMap } from '@/mappers/material-request-mappers-translate';
import { IMaterialRequestWithRelations } from '../../../../request/material-request-types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MaterialRequestDetails({
  materialRequest,
}: {
  materialRequest: IMaterialRequestWithRelations;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 px-4 md:grid-cols-3'>
      <div className='space-y-2'>
        <Label>Número do Protocolo</Label>
        <p className='text-muted-foreground'>
          {materialRequest.protocolNumber}
        </p>
      </div>
      <div className='space-y-2'>
        <Label>Login do Usuário SIPAC</Label>
        <p className='text-muted-foreground'>
          {materialRequest.sipacUserLoginRequest}
        </p>
      </div>
      <div className='space-y-2'>
        <Label>Valor da Requisição</Label>
        <p className='text-muted-foreground'>
          {Number(materialRequest.requestValue).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </p>
      </div>
      <div className='space-y-2'>
        <Label>Valor Atendido</Label>
        <p className='text-muted-foreground'>
          {Number(materialRequest.servedValue).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </p>
      </div>
      <div className='space-y-2'>
        <Label>Status Atual</Label>
        <p className='text-muted-foreground'>
          {statusMaterialRequestDisplayMap[materialRequest.currentStatus]}
        </p>
      </div>
      <div className='space-y-2'>
        <Label>Data da Requisição</Label>
        <p className='text-muted-foreground'>
          {format(new Date(materialRequest.createdAt), 'dd/MM/yyyy', {
            locale: ptBR,
          })}
        </p>
      </div>
    </div>
  );
}
