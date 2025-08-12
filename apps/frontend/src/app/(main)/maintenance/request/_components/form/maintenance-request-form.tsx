'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import {
  maintenanceRequestFormSchemaAdd,
  maintenanceRequestFormSchemaEdit
} from './maintenance-request-form-validation';
import {
  IMaintenanceRequestAdd,
  IMaintenanceRequestEdit
} from '../../request-types';
import { Button } from '@/components/ui/button';

interface MaintenanceRequestFormProps {
  defaultValues?: Partial<IMaintenanceRequestAdd> & { id?: number };
  onSubmit: (values: IMaintenanceRequestAdd | IMaintenanceRequestEdit) => void;
  isSubmitting?: boolean;
  relatedData?: any; // TODO: Replace with proper type
}

export function MaintenanceRequestForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  relatedData
}: MaintenanceRequestFormProps) {
  const schema = defaultValues?.id
    ? maintenanceRequestFormSchemaEdit
    : maintenanceRequestFormSchemaAdd;

  const form = useForm({
    defaultValues: defaultValues as
      | IMaintenanceRequestAdd
      | IMaintenanceRequestEdit,
    onSubmit: async ({ value }) => {
      const result = schema.safeParse(value);
      if (result.success) {
        onSubmit(value);
      }
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className='space-y-4'
    >
      <form.Field
        name='title'
        validators={{
          onChange: schema.shape.title
        }}
        children={(field) => (
          <div className='space-y-2'>
            <label htmlFor={field.name}>Título</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='Digite o título da requisição'
              className='w-full rounded border p-2'
            />
            {field.state.meta.errors && (
              <p className='text-sm text-red-500'>
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name='description'
        validators={{
          onChange: schema.shape.description
        }}
        children={(field) => (
          <div className='space-y-2'>
            <label htmlFor={field.name}>Descrição</label>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='Descreva a requisição'
              className='w-full rounded border p-2'
            />
          </div>
        )}
      />

      <form.Field
        name='deadline'
        validators={{
          onChange: schema.shape.deadline
        }}
        children={(field) => (
          <div className='space-y-2'>
            <label htmlFor={field.name}>Prazo</label>
            <input
              type='date'
              id={field.name}
              name={field.name}
              value={field.state.value?.toISOString().split('T')[0]}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(new Date(e.target.value))}
              className='w-full rounded border p-2'
            />
          </div>
        )}
      />

      <form.Field
        name='serviceTypeId'
        validators={{
          onChange: schema.shape.serviceTypeId
        }}
        children={(field) => (
          <div className='space-y-2'>
            <label htmlFor={field.name}>Tipo de Serviço</label>
            <select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className='w-full rounded border p-2'
            >
              <option value=''>Selecione o tipo de serviço</option>
              {relatedData?.listServiceTypes?.map((st: any) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        )}
      />

      <form.Field
        name='assignedToId'
        validators={{
          onChange: schema.shape.assignedToId
        }}
        children={(field) => (
          <div className='space-y-2'>
            <label htmlFor={field.name}>Atribuído a</label>
            <select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className='w-full rounded border p-2'
            >
              <option value=''>Selecione o responsável</option>
              {relatedData?.listUsers?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}
      />

      <Button type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
