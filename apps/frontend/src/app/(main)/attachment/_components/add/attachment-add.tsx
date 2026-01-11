'use client';

import type React from 'react';
import { useState } from 'react';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import AttachmentForm from '../form/attachment-form';
import { IAttachment, IAttachmentAdd } from '../../attachment-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { Paperclip, Plus } from 'lucide-react';
import { createAttachment } from '../../attachment-actions';
import { attachmentFormSchemaAdd } from '../form/attachment-form-validation';
import { useRouter } from 'next/navigation';

export default function AttachmentAdd({
  isInDialog = false,
  preDefaultData = {}
}: {
  isInDialog?: boolean;
  preDefaultData?: Partial<IAttachmentAdd>;
}) {
  const defaultData: IAttachmentAdd = {
    relatedId: '',
    relatedModel: '',
    file: null as any,
    ...preDefaultData
  };

  const fieldLabels: Partial<Record<keyof IAttachmentAdd, string>> = {
    relatedId: 'ID Relacionado',
    relatedModel: 'Modelo Relacionado',
    file: 'Arquivo'
  };

  const initialServerState: IActionResultForm<IAttachmentAdd, IAttachment> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/attachment');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={Paperclip}
        title='Novo Anexo'
        subtitle='Adicionar um novo anexo ao sistema'
      />

      <AttachmentForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any}
        formActionProp={createAttachment as any}
        formSchema={attachmentFormSchemaAdd}
        SubmitButtonIcon={Plus}
        submitButtonText='Criar Anexo'
        isInDialog={isInDialog}
      />
    </div>
  );
}
