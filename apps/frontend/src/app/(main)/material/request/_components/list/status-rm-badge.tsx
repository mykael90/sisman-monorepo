'use client';

import { Badge } from '@/components/ui/badge';
import {
  statusMaterialRequestDisplayMap,
  StatusMaterialRequestKey
} from '@/mappers/material-request-mappers-translate';
import {
  Settings,
  FileText,
  Clock,
  RefreshCcw,
  CheckCircle,
  Send,
  MinusCircle,
  CheckSquare,
  XCircle,
  Undo,
  Truck,
  Inbox,
  UserCheck,
  Edit,
  CornerUpLeft
} from 'lucide-react';

const materialRequestStatusConfig: Record<
  StatusMaterialRequestKey,
  {
    label: string;
    icon: React.ElementType;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'outline'
      | 'success'
      | 'warning';
  }
> = {
  SIPAC_HANDLING: {
    label: statusMaterialRequestDisplayMap.SIPAC_HANDLING,
    icon: Settings,
    variant: 'secondary'
  },
  REGISTERED: {
    label: statusMaterialRequestDisplayMap.REGISTERED,
    icon: FileText,
    variant: 'default'
  },
  PENDING: {
    label: statusMaterialRequestDisplayMap.PENDING,
    icon: Clock,
    variant: 'default'
  },
  CHANGE_SPONSOR: {
    label: statusMaterialRequestDisplayMap.CHANGE_SPONSOR,
    icon: RefreshCcw,
    variant: 'secondary'
  },
  APPROVED: {
    label: statusMaterialRequestDisplayMap.APPROVED,
    icon: CheckCircle,
    variant: 'success'
  },
  FORWARDED: {
    label: statusMaterialRequestDisplayMap.FORWARDED,
    icon: Send,
    variant: 'default'
  },
  PARTIALLY_ATTENDED: {
    label: statusMaterialRequestDisplayMap.PARTIALLY_ATTENDED,
    icon: MinusCircle,
    variant: 'warning'
  },
  FULLY_ATTENDED: {
    label: statusMaterialRequestDisplayMap.FULLY_ATTENDED,
    icon: CheckSquare,
    variant: 'success'
  },
  REJECTED: {
    label: statusMaterialRequestDisplayMap.REJECTED,
    icon: XCircle,
    variant: 'destructive'
  },
  CANCELLED: {
    label: statusMaterialRequestDisplayMap.CANCELLED,
    icon: XCircle,
    variant: 'destructive'
  },
  REVERSED: {
    label: statusMaterialRequestDisplayMap.REVERSED,
    icon: Undo,
    variant: 'secondary'
  },
  MATERIAL_SENT: {
    label: statusMaterialRequestDisplayMap.MATERIAL_SENT,
    icon: Truck,
    variant: 'default'
  },
  MATERIAL_RECEIVED: {
    label: statusMaterialRequestDisplayMap.MATERIAL_RECEIVED,
    icon: Inbox,
    variant: 'success'
  },
  PENDING_CHIEF: {
    label: statusMaterialRequestDisplayMap.PENDING_CHIEF,
    icon: UserCheck,
    variant: 'default'
  },
  CHANGED: {
    label: statusMaterialRequestDisplayMap.CHANGED,
    icon: Edit,
    variant: 'secondary'
  },
  ITEM_RETURNED: {
    label: statusMaterialRequestDisplayMap.ITEM_RETURNED,
    icon: CornerUpLeft,
    variant: 'secondary'
  },
  RETURNED: {
    label: statusMaterialRequestDisplayMap.RETURNED,
    icon: CornerUpLeft,
    variant: 'secondary'
  }
};

interface StatusRmBadgeProps {
  statusKey: StatusMaterialRequestKey;
}

export function StatusRmBadge({ statusKey }: StatusRmBadgeProps) {
  const config = materialRequestStatusConfig[statusKey];

  if (!config) {
    return (
      <div className='whitespace-normal'>
        {statusMaterialRequestDisplayMap[statusKey] || statusKey}
      </div>
    );
  }

  const Icon = config.icon;
  return (
    <div className='w-full'>
      <Badge variant={config.variant}>
        <Icon className='mr-1 h-3 w-3' />
        {config.label}
      </Badge>
    </div>
  );
}
