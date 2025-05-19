import { z } from 'zod';

// Schema Zod (adapte conforme sua necessidade)
const userFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  // a string de login deve ter obrigatoriamente um ponto dividindo 2 nomes

  // eu quero inserir essas 2 restriçÕes para login
  login: z
    .string()
    .regex(/\./, 'Login must contain a dot (.)')
    .min(3, 'Login must be at least 3 characters'),
  email: z.string().email('Invalid email address')
  // roles: z.array(z.string()).min(1, 'At least one role is required'),
  // avatarUrl: z
  //   .string()
  //   .url('Invalid URL for avatar')
  //   .optional()
  //   .or(z.literal(''))
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
export default userFormSchema;
