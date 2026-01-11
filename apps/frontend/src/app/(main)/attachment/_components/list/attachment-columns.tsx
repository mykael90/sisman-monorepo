'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  deleteAttachment,
  getAttachmentFileView
} from '../../attachment-actions';
import { IAttachment } from '../../attachment-types';

const handleView = async (attachment: IAttachment) => {
  try {
    const fileResponse = await getAttachmentFileView(String(attachment.id));
    if (fileResponse?.buffer) {
      const blob = new Blob([fileResponse.buffer], {
        type: fileResponse.contentType || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } else {
      toast.error('Não foi possível obter o arquivo para visualização.');
    }
  } catch (error) {
    toast.error('Erro ao tentar visualizar o anexo.');
  }
};

const handleDownload = async (attachment: IAttachment) => {
  try {
    const fileResponse = await getAttachmentFileView(String(attachment.id));
    if (fileResponse?.buffer) {
      const blob = new Blob([fileResponse.buffer], {
        type: fileResponse.contentType || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      toast.error('Não foi possível obter o arquivo para download.');
    }
  } catch (error) {
    toast.error('Erro ao tentar baixar o anexo.');
  }
};

const handleDelete = async (
  attachmentId: number,
  refreshAttachments: () => void
) => {
  const result = await deleteAttachment(attachmentId);
  if (result.isSubmitSuccessful) {
    toast.success(result.message);
    refreshAttachments();
  } else {
    toast.error(result.message);
  }
};

export const columns = (
  refreshAttachments: () => void
): ColumnDef<IAttachment>[] => [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'originalName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome do Arquivo
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    }
  },
  {
    accessorKey: 'relatedModel',
    header: 'Modelo Relacionado'
  },
  {
    accessorKey: 'relatedId',
    header: 'ID Relacionado'
  },
  {
    accessorKey: 'mimetype',
    header: 'Tipo'
  },
  {
    accessorKey: 'size',
    header: 'Tamanho (bytes)',
    cell: ({ row }) => {
      const size = parseFloat(row.getValue('size'));
      return new Intl.NumberFormat('pt-BR').format(size);
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Criado em',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const attachment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Abrir menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleView(attachment)}>
              <Eye className='mr-2 h-4 w-4' />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(attachment)}>
              <Download className='mr-2 h-4 w-4' />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => handleDelete(attachment.id, refreshAttachments)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
