import { z } from 'zod';

export const WorkerAddSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório')
});

export const WorkerEditSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório')
});

export type WorkerAddForm = z.infer<typeof WorkerAddSchema>;
export type WorkerEditForm = z.infer<typeof WorkerEditSchema>;
