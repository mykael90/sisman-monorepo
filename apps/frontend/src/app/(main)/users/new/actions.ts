// app/users/actions.ts
'use server';

// import { z } from 'zod';
import { UserFormData } from './user'; // Ajuste o caminho se necessário

// Defina um schema Zod para validação no servidor (recomendado)
// Este schema pode ser o mesmo ou similar ao que você usaria no cliente
// const userFormSchema = z.object({
//   fullName: z.string().min(3, 'Full name must be at least 3 characters'),
//   username: z.string().min(3, 'Username must be at least 3 characters'),
//   email: z.string().email('Invalid email address'),
//   roles: z.array(z.string()).min(1, 'At least one role must be selected'),
//   avatarUrl: z
//     .string()
//     .url('Invalid URL for avatar')
//     .optional()
//     .or(z.literal(''))
//     .nullable()
// });

export interface CreateUserActionResult {
  success: boolean;
  message?: string;
  errors?: Record<keyof UserFormData, string[]> | null; // Erros por campo
  formErrors?: string[]; // Erros gerais do formulário
  createdUser?: UserFormData; // Ou o tipo de usuário retornado pelo DB
}

export async function createUserAction(
  data: UserFormData
): Promise<CreateUserActionResult> {
  console.log('Server Action received data:', data);

  //   const validationResult = userFormSchema.safeParse(data);
  //simulando sucesso
  const validationResult = {
    success: true,
    error: null,
    data: { ...data }
  };

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors as Record<
      keyof UserFormData,
      string[]
    >;
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: fieldErrors
    };
  }

  const { fullName, username, email, roles, avatarUrl } = validationResult.data;

  try {
    // Simule a lógica de criação do usuário no banco de dados
    console.log(`Creating user: ${username} with email ${email}`);
    // const newUser = await db.user.create({ data: { ... } });

    // Simulação de sucesso
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula latência da rede

    // Simulação de um erro de duplicação de email no servidor, por exemplo
    if (email === 'test@example.com') {
      return {
        success: false,
        message: 'Server-side validation failed.',
        errors: { email: ['This email is already taken on the server.'] }
      };
    }

    return {
      success: true,
      message: `User "${fullName}" created successfully!`,
      createdUser: validationResult.data // Retorne os dados criados se útil
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      formErrors: [
        'An unexpected error occurred on the server. Please try again.'
      ]
    };
  }
}
