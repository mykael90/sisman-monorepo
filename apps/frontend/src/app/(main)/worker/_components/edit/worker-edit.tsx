import { FormAddHeader } from 'components/form-tanstack/form-add-header';
import { WorkerEditSchema } from '../form/worker-form-validation';
import { updateWorker } from '../../worker-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { valibotValidator } from '@tanstack/valibot-form-adapter';
import { ErrorServerForm } from 'components/form-tanstack/error-server-form';
import { useState } from 'react';
import { FormSuccessDisplayCard } from 'components/form-tanstack/form-success-display-card';
import { Worker } from '../../worker-types';

export default function WorkerEdit({
  initialWorker,
  isInDialog = false
}: {
  initialWorker: Worker;
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const [errorServer, setErrorServer] = useState('');
  const [successServer, setSuccessServer] = useState('');

  const form = useForm({
    validator: valibotValidator,
    defaultValues: {
      name: initialWorker.name,
      cpf: initialWorker.cpf,
      email: initialWorker.email,
      phone: initialWorker.phone,
      address: initialWorker.address,
      city: initialWorker.city,
      state: initialWorker.state,
      zip: initialWorker.zip,
      country: initialWorker.country,
      occupation: initialWorker.occupation,
      salary: initialWorker.salary,
      admissionDate: initialWorker.admissionDate,
      status: initialWorker.status
    },
    onSubmit: async ({ value }) => {
      const result = await updateWorker(initialWorker.id, value);
      if (result.success) {
        toast.success('Worker atualizado com sucesso!');
        setSuccessServer('Worker atualizado com sucesso!');
        router.push('/worker');
      } else {
        setErrorServer(result.message);
        toast.error(result.message);
      }
    }
  });

  return (
    <>
      <FormAddHeader
        title='Editar Worker'
        description='Preencha os campos para editar um worker existente.'
        isInDialog={isInDialog}
      />

      <ErrorServerForm message={errorServer} />
      <FormSuccessDisplayCard message={successServer} />

      <WorkerForm form={form} />
    </>
  );
}
