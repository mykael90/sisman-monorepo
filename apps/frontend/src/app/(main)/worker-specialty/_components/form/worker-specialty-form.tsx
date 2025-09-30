'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  addWorkerSpecialty,
  updateWorkerSpecialty
} from '../../worker-specialty-actions';
import {
  IWorkerSpecialty,
  IWorkerSpecialtyAdd,
  IWorkerSpecialtyEdit
} from '../../worker-specialty-types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.'
  }),
  description: z.string().optional()
});

type WorkerSpecialtyFormValues = z.infer<typeof formSchema>;

interface WorkerSpecialtyFormProps {
  initialData: IWorkerSpecialty | null;
}

export function WorkerSpecialtyForm({ initialData }: WorkerSpecialtyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const title = initialData
    ? 'Editar Especialidade de Trabalhador'
    : 'Criar Especialidade de Trabalhador';
  const description = initialData
    ? 'Edite uma especialidade de trabalhador existente.'
    : 'Adicione uma nova especialidade de trabalhador.';
  const toastMessage = initialData
    ? 'Especialidade de trabalhador atualizada.'
    : 'Especialidade de trabalhador criada.';
  const action = initialData ? 'Salvar alterações' : 'Criar';

  const form = useForm<WorkerSpecialtyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (values: WorkerSpecialtyFormValues) => {
    startTransition(async () => {
      let result;
      if (initialData) {
        const dataToUpdate: IWorkerSpecialtyEdit = {
          id: initialData.id,
          ...values
        };
        result = await updateWorkerSpecialty(undefined, dataToUpdate);
      } else {
        const dataToAdd: IWorkerSpecialtyAdd = values;
        result = await addWorkerSpecialty(undefined, dataToAdd);
      }

      if (result?.isSubmitSuccessful) {
        toast({
          title: toastMessage
        });
        router.push('/worker-specialty');
        router.refresh();
      } else {
        toast({
          title: 'Erro',
          description:
            result?.errorsServer?.[0] || 'Ocorreu um erro inesperado.',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'
        >
          <div className='grid grid-cols-3 gap-8'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder='Nome da especialidade'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder='Descrição da especialidade (opcional)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isPending} className='ml-auto' type='submit'>
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
}
