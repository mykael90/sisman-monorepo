'use client';

import FormAddHeader from '@/components/form-tanstack/form-add-header';
import { initialServerState } from '@/types/types-server-actions';
import AttachmentFormBatch from '../form/attachment-form-batch';
import { IAttachmentAddBatch } from '../../attachment-types';
import {
  attachmentFormSchemaAddBatch,
  AttachmentFormSchemaAddBatch
} from '../form/attachment-form-validation';
import { attachmentFormActionBatch } from '../../attachment-actions';

const defaultData: IAttachmentAddBatch = {
  relatedId: '',
  relatedModel: '',
  files: []
};

const attachmentFormBatchFieldLabels: {
  [k in keyof AttachmentFormSchemaAddBatch]: string;
} = {
  relatedId: 'ID do Registro Relacionado',
  relatedModel: 'Modelo Relacionado',
  files: 'Arquivos a Anexar'
};

export default function AttachmentAddBatch() {
  return (
    <div className='flex flex-col gap-6 md:p-6'>
      <FormAddHeader
        title='Adicionar Anexos em Lote'
        description='Preencha os dados e selecione múltiplos arquivos para anexar a um registro.'
        isReturnButton
        isCleanButton
        isDownloadPdfButton
        returnLink='../attachment'
      />
      <AttachmentFormBatch
        mode='add'
        defaultData={defaultData}
        formActionProp={attachmentFormActionBatch}
        initialServerState={initialServerState}
        fieldLabels={attachmentFormBatchFieldLabels}
        formSchema={attachmentFormSchemaAddBatch}
        submitButtonText='Adicionar Anexos'
      />
    </div>
  );
}
