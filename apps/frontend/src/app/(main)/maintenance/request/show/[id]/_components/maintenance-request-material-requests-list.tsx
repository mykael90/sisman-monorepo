import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatOnlyDate } from '@/lib/utils';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';
import { IMaintenanceRequestShowWithRelations } from '../../../maintenance-request-types';
import {
  materialOriginDisplayMap,
  materialRequestTypeDisplayMap,
  statusMaterialRequestDisplayMap
} from '../../../../../../../mappers/material-request-mappers-translate';

interface Props {
  materialRequests: IMaintenanceRequestShowWithRelations['materialRequests'];
}

export function MaintenanceRequestMaterialRequestsList({
  materialRequests
}: Props) {
  if (!materialRequests || materialRequests.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma requisição de material vinculada para esta requisição de
          manutenção.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {materialRequests.map((materialRequest) => (
        <Card key={materialRequest.id} className='overflow-hidden'>
          <CardHeader className='bg-gray-50 py-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-md'>
                  RM: {materialRequest.protocolNumber}
                </CardTitle>
                <p className='text-sm text-gray-500'>
                  ID: {materialRequest.id} &bull; Data:{' '}
                  {formatOnlyDate(materialRequest.requestDate)}
                </p>
              </div>
              <div className='text-sm font-medium'>
                <Badge variant='secondary' className='text-xs'>
                  Status:{' '}
                  {statusMaterialRequestDisplayMap[
                    materialRequest.currentStatus
                  ] || materialRequest.currentStatus}
                </Badge>
              </div>
            </div>
            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge variant='outline' className='text-xs'>
                Origem:{' '}
                {materialOriginDisplayMap[materialRequest.origin] ||
                  materialRequest.origin}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                Tipo:{' '}
                {materialRequestTypeDisplayMap[materialRequest.requestType] ||
                  materialRequest.requestType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Almorifado de Origem
                </p>
                <p className='font-medium'>
                  {materialRequest?.storage?.name ||
                    `Depósito ${materialRequest.storageId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Solicitado por
                </p>
                <p className='font-medium'>
                  {materialRequest.requestedBy?.name ||
                    materialRequest.sipacUserLoginRequest ||
                    `Usuário ${materialRequest.requestedById}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>Valor Total</p>
                <p className='font-medium'>
                  {formatCurrency(materialRequest.requestValue)}
                </p>
              </div>
            </div>

            {materialRequest.items && materialRequest.items.length > 0 && (
              <div className='mt-4 border-t pt-4'>
                <p className='mb-2 text-sm font-medium'>
                  Itens da Requisição de Material (
                  {materialRequest.items.length})
                </p>
                <div className='rounded-md border'>
                  <Table className='text-xs'>
                    <TableHeader className='bg-gray-100'>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Qtd Solicitada</TableHead>
                        <TableHead>Qtd Aprovada</TableHead>
                        <TableHead>Qtd Entregue</TableHead>
                        <TableHead>Qtd Retornada</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Total do Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialRequest.items.map((item) => {
                        const itemTotal =
                          Number(item.quantityRequested) *
                          Number(item.unitPrice);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className='font-medium'>
                                {item.requestedGlobalMaterial?.name}
                              </div>
                              <div className='text-muted-foreground line-clamp-2 text-xs'>
                                {item.requestedGlobalMaterial?.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.requestedGlobalMaterial?.id || '-'}
                            </TableCell>
                            <TableCell>
                              {item.requestedGlobalMaterial?.unitOfMeasure ||
                                '-'}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityRequested).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityApproved).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityDelivered).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityReturned).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className='font-medium'>
                              {formatCurrency(itemTotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {materialRequest.notes && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-xs font-medium text-gray-500'>Observações</p>
                <p className='text-muted-foreground text-sm'>
                  {materialRequest.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
