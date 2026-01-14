import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  User,
  Building,
  DollarSign,
  BarChart3,
  Warehouse,
  FileText
} from 'lucide-react';
import { formatCurrency, formatOnlyDate } from '@/lib/utils';
import { materialPurposeDisplayMap } from '@/mappers/material-request-mappers-translate';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  data: IMaterialRequestShowWithRelations;
}

export function MaterialRequestGeneralInfo({ data }: Props) {
  // Recalculo simples caso o valor não venha do back
  const totalRequestValue =
    data.items?.reduce(
      (sum, item) =>
        sum + Number(item.quantityRequested) * Number(item.unitPrice || 0),
      0
    ) || 0;

  return (
    <Card>
      <CardContent className='space-y-6 pt-6'>
        {/* Grid de Detalhes */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Data da Requisição
            </Label>
            <p className='text-muted-foreground'>
              {formatOnlyDate(data.requestDate)}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              Solicitante
            </Label>
            <p className='text-muted-foreground'>
              {data.sipacUnitRequesting?.nomeUnidade || 'Não informado'}
              {data.sipacUserLoginRequest && (
                <span className='text-muted-foreground block text-xs'>
                  Login: {data.sipacUserLoginRequest}
                </span>
              )}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Building className='h-4 w-4' />
              Unidade de Custeio
            </Label>
            <p className='text-muted-foreground'>
              {data.sipacUnitCost?.nomeUnidade || 'Não informado'}
              {data.sipacUnitCost?.sigla && (
                <span className='text-muted-foreground block text-xs'>
                  Sigla: {data.sipacUnitCost.sigla}
                </span>
              )}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Valor Total
            </Label>
            <p className='text-primary text-lg font-semibold'>
              {formatCurrency(data.requestValue || totalRequestValue)}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Finalidade
            </Label>
            <p className='text-muted-foreground'>
              {materialPurposeDisplayMap[data.purpose] || data.purpose}
            </p>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Warehouse className='h-4 w-4' />
              Almoxarifado
            </Label>
            <p className='text-muted-foreground'>
              {data.storage?.name || 'Não informado'}
            </p>
          </div>
        </div>

        {/* Justificativa e Observações */}
        {data.justification && (
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Justificativa
            </Label>
            <p className='text-muted-foreground whitespace-pre-wrap'>
              {data.justification}
            </p>
          </div>
        )}

        {data.notes && (
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Observações
            </Label>
            <p className='text-muted-foreground whitespace-pre-wrap'>
              {data.notes}
            </p>
          </div>
        )}

        {/* Requisição de Manutenção Vinculada */}
        {data.maintenanceRequest && (
          <div className='space-y-2 rounded-lg border p-4'>
            <Label className='flex items-center gap-2 text-lg'>
              <Building className='h-5 w-5' />
              Requisição de Manutenção Vinculada
            </Label>
            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
              <div>
                <p className='text-sm font-medium'>Protocolo:</p>
                <p className='text-muted-foreground'>
                  {data.maintenanceRequest.protocolNumber}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Edificação:</p>
                <p className='text-muted-foreground'>
                  {data.maintenanceRequest.building?.name || 'Não informado'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
