import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react'; // Adicionado Eye para a ação de visualização

interface DefaultRowActionProps<TData> {
  row: Row<TData>;
  configuredActions: {
    onEdit?: (row: Row<TData>) => void;
    onDelete?: (row: Row<TData>) => void;
    onView?: (row: Row<TData>) => void; // Adicionado onView
  };
}

export function DefaultRowAction<TData>({
  row,
  configuredActions
}: DefaultRowActionProps<TData>) {
  return (
    <div className='flex gap-2'>
      {configuredActions.onView && (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onView!(row)}
        >
          <Eye className='h-4 w-4' />
        </Button>
      )}
      {configuredActions.onEdit && (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit!(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
      )}
      {configuredActions.onDelete && (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete!(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      )}
    </div>
  );
}
