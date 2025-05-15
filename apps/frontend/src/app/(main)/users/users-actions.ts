'use server';

import { revalidatePath } from 'next/cache';
import fetchApiSisman, { SismanApiError } from '../../../lib/fetch/api-sisman';
import Logger from '@/lib/logger';
import { UserFormData } from './_components/add/user-add';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { z } from 'zod';
import { IUserList } from './users-types';

const logger = new Logger('users-data-client/_actions');

const defaultFormValues: UserFormData = {
  name: '',
  login: '',
  email: ''
};

export async function getUsers(
  accessTokenSisman: string
): Promise<IUserList[]> {
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
  errorsServer?: string[]; // Erros globais de formulário gerados no lado do servidor
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
    const rawData = formDataToObject(formData);
    const validationResult = userFormSchemaOnServer.safeParse(rawData);
    logger.info(JSON.stringify(validationResult));

    if (!validationResult.success) {
      const fieldMeta: Partial<
        Record<keyof UserFormData, { errors: string[] }>
      > = {};
      validationResult.error.issues.forEach((err) => {
        const pathKey = err.path.join('.') as keyof UserFormData;
        // Garante que fieldMeta[pathKey] exista e tenha uma propriedade 'errors' como array.
        if (!fieldMeta[pathKey]) {
          fieldMeta[pathKey] = { errors: [] };
        }
        // Agora é seguro adicionar a mensagem de erro, pois fieldMeta[pathKey].errors existe.
        fieldMeta[pathKey]!.errors.push(err.message);
      });
      return {
        isSubmitSuccessful: false,
        errorsServer: [
          'Favor, corrigir os campos com indicações de erro marcadas em vermelho.'
        ],
        message: 'Validation failed on server.',
        fieldMeta: fieldMeta,
        submittedData: formData // Retorna os dados submetidos para correção
      };
    }

    const validatedData = validationResult.data;

    // const validatedData = await serverValidate(formData);
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
      message: 'User created successfully!',
      errorsServer: []
    };

    return createUserActionResult;
  } catch (error) {
    // if (error instanceof ServerValidateError) {
    //   const createUserActionResult: ICreateUserActionResult = {
    //     isSubmitSuccessful: false,
    //     submittedData: formDataToObject(formData),
    //     message: `Erro de validação do servidor: ${error.formState}`
    //     // fieldMeta: {
    //     //   name: {
    //     //     errors: ['Nome Ao mínimo 3 letras']
    //     //   }
    //     // }
    //   };

    //   return { ...error.formState, ...createUserActionResult };
    // } else
    if (error instanceof SismanApiError) {
      // Tratar erros conhecidos para melhor experiência do usuário. Exemplo, duplicação de registro não gerar reset no formulário, dà a possibilidade do usuário tentar trocar os dados.
      logger.error(
        `Erro conhecido: Status: ${error.statusCode}, Type: ${error.errorType}, API Msg: ${error.apiMessage}`
      );

      if (error.statusCode === 409) {
        const createUserActionResult: ICreateUserActionResult = {
          isSubmitSuccessful: false,
          errorsServer: [error.apiMessage],
          submittedData: formDataToObject(formData),
          message: error.apiMessage
        };

        //retorna para a tela para que o usuário possa corrigir as informações
        return createUserActionResult;
      }

      //vai para a captura de erro do nextjs mais próxima
      throw error;
    }

    // Some other error occurred while validating your form
    throw error;
  }
}

function formDataToObject<T = any>(formData: FormData): T {
  return Object.fromEntries(formData.entries()) as T;
}
