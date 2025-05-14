'use server';

import {
  ServerValidateError,
  createServerValidate
} from '@tanstack/react-form/nextjs';

import { revalidatePath } from 'next/cache';
import fetchApiSisman, { SismanApiError } from '../../../lib/fetch/api-sisman';
import Logger from '@/lib/logger';
import { UserFormData } from './new/user';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { z } from 'zod';
import { formOpts } from './new/shared-code';

const logger = new Logger('users-data-client/_actions');

const defaultFormValues: UserFormData = {
  name: '',
  login: '',
  email: ''
};

export async function getUsers(accessTokenSisman: string) {
  logger.info('(Server Action) getUsers: Called for initial page load.');
  const response = await fetchApiSisman('/users', accessTokenSisman, {
    cache: 'no-store'
  });
  const data = await response.json();
  // console.log(data);
  // const aguarde = await new Promise(resolve => setTimeout(resolve, 2000));

  return data;
}

export async function getRefreshedUsers() {
  // logger.info(
  //   '(Server Action) refreshUsersData: Called by client, fetching new data...'
  // );
  // const response = await getUsers();

  // Revalida o caminho APÓS buscar os dados e ANTES de retornar (ou em paralelo)
  // Esta é a ação que o usuário disparou.
  logger.info(
    '(Server Action) refreshUsersData: Revalidating /users-data-client'
  );
  revalidatePath('/users-data-client');

  logger.info(
    '(Server Action) refreshUsersData: Path revalidated, returning new data.'
  );

  // Opcionalmente, pode retornar os novos dados para o cliente
  // mas a revalidação + router.refresh() cuidará da UI.
  // Veja que já utiliza a funcão getUsers para montar um novo compomente no server com o revalidatePath,
  // logo esse retorno é apenas para mandar para o cliente, mas lá pode não ter utilidade
  // return response;
}

export interface ICreateUserActionResult {
  isSubmitSuccessful?: boolean;
  errors?: string[]; // Erros globais de formulário
  errorMap?: Record<string, string>;
  values?: Partial<UserFormData>;
  createdUser?: UserFormData;
  submittedData?: Partial<UserFormData>; // Para mergeForm usar para atualizar valores
  fieldMeta?: Partial<
    Record<
      keyof UserFormData,
      {
        errors: string[];
      }
    >
  >;
  message: string;
}

// Schema Zod (adapte conforme sua necessidade)
const userFormSchemaOnServer = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  login: z.string().min(3, 'Login must be at least 3 characters'),
  email: z.string().email('Invalid email address')
  // roles: z.array(z.string()).min(1, 'At least one role is required'),
  // avatarUrl: z
  //   .string()
  //   .url('Invalid URL for avatar')
  //   .optional()
  //   .or(z.literal(''))
});

//insira validação para o email também
const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    const errors: string[] = [];

    if (value.name.length < 3) {
      errors.push('Nome Ao mínimo 3 letras');
    }

    if (value.login.length < 3) {
      errors.push('Login Ao mínimo 3 letras');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.email)) {
      errors.push('E-mail inválido');
    }

    if (errors.length > 0) {
      return `Server validation: ${errors.join(' | ')}`;
    }
  }
});

export async function addUser(
  // Mesmo que não o usemos ativamente, ele precisa estar na assinatura.
  // O tipo do estado anterior deve corresponder ao tipo de retorno da action.
  prev: unknown, // ou apenas CreateUserActionResult se initialFormState for compatível
  formData: FormData
) {
  console.log('Estado prévio:', prev); // Para depuração
  console.log(formData);
  logger.warn('aqui antes do serverValidate');
  try {
    // const rawData = formDataToObject(formData);
    // const validatedData = userFormSchemaOnServer.safeParse(rawData);

    // const rawData = formDataToObject(formData);
    // const validationResult = userFormSchemaOnServer.safeParse(rawData);

    // // TODO:
    // // const validatedData = userFormSchemaOnServer.safeParse(formData);
    // const validationResult = {
    //   success: true,
    //   error: null,
    //   data: { ...formData }
    // };

    // if (!validatedData.success) {
    //   const fieldErrors: Partial<Record<keyof UserFormData, string[]>> = {};
    //   validatedData.error.errors.forEach((err) => {
    //     const path = err.path.join('.') as keyof UserFormData;
    //     fieldErrors[path] = fieldErrors[path]
    //       ? [...fieldErrors[path], err.message]
    //       : [err.message];
    //   });
    //   return {
    //     success: false,
    //     message: 'Validation failed on server.',
    //     errors: fieldErrors,
    //     submittedData: formData // Retorna os dados submetidos para correção
    //   };
    // }

    const validatedData = await serverValidate(formData);
    console.log('validatedData', validatedData);

    //obter token de acesso, somente administrador pode cadastrar usuário
    const accessTokenSisman = await getSismanAccessToken();

    const response = await fetchApiSisman('/users', accessTokenSisman, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validatedData)
    });

    const createdUserData = await response.json();

    const createUserActionResult: ICreateUserActionResult = {
      isSubmitSuccessful: true,
      createdUser: createdUserData,
      submittedData: formDataToObject(formData),
      message: 'User created successfully!'
    };

    return createUserActionResult;
  } catch (error) {
    if (error instanceof ServerValidateError) {
      const createUserActionResult: ICreateUserActionResult = {
        isSubmitSuccessful: false,
        submittedData: formDataToObject(formData),
        message: `Erro de validação do servidor: ${error.formState}`
        // fieldMeta: {
        //   name: {
        //     errors: ['Nome Ao mínimo 3 letras']
        //   }
        // }
      };

      return { ...error.formState, ...createUserActionResult };
    } else if (error instanceof SismanApiError) {
      // Tratar erros conhecidos para melhor experiência do usuário. Exemplo, duplicação de registro não gerar reset no formulário, dà a possibilidade do usuário tentar trocar os dados.
      logger.error(
        `Erro conhecido: Status: ${error.statusCode}, Type: ${error.errorType}, API Msg: ${error.apiMessage}`
      );

      const createUserActionResult: ICreateUserActionResult = {
        isSubmitSuccessful: false,
        errors: [error.apiMessage],
        errorMap: {
          email: error.apiMessage
        },
        submittedData: formDataToObject(formData),
        message: error.apiMessage
      };

      return createUserActionResult;
    }

    // Some other error occurred while validating your form
    throw error;
  }
}

function formDataToObject<T = any>(formData: FormData): T {
  return Object.fromEntries(formData.entries()) as T;
}
