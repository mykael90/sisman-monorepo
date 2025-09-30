import { z } from 'zod';
import { normalizeDate } from '../../../../../lib/utils';

export const WorkerAddSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthdate: z.preprocess(
    normalizeDate,
    z.string().min(1, 'Data de nascimento é obrigatória')
  )
});

export const WorkerEditSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthdate: z.preprocess(
    normalizeDate,
    z.string().min(1, 'Data de nascimento é obrigatória')
  )
});

export type WorkerAddForm = z.infer<typeof WorkerAddSchema>;
export type WorkerEditForm = z.infer<typeof WorkerEditSchema>;
