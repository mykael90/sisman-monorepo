import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  IMaintenanceRequestBalanceWithRelations,
  IMaintenanceRequestShowWithRelations
} from '@/app/(main)/maintenance/request/maintenance-request-types';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { MaterialBalanceSummaryTable } from '../../../../../material/(warehouse)/withdrawal/_components/material-balance-summary-table';

interface IMaintenanceRequestMaterialBalance {
  data: IMaintenanceRequestBalanceWithRelations | null;
}

export function MaintenanceRequestMaterialBalance({
  data
}: IMaintenanceRequestMaterialBalance) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Balanço de Materiais</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Por enquanto, vou deixar um placeholder ou adaptar o componente */}
        {data?.itemsBalance && (
          <MaterialBalanceSummaryTable itemsBalance={data.itemsBalance} />
        )}
      </CardContent>
    </Card>
  );
}
