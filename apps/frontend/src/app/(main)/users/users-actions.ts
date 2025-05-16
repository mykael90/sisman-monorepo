'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import fetchApiSisman, { SismanApiError } from '../../../lib/fetch/api-sisman';
import formDataToObject from '../../../lib/formdata-to-object';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IUserAdd, IUserList } from './users-types';
import userFormSchema from './_components/add/users-validation-form';

const pagePath = '/users';

const logger = new Logger(`${pagePath}/_actions`);

export async function getUsers(
  accessTokenSisman: string
): Promise<IUserList[]> {
  logger.info('(Server Action) getUsers: Called.');

  // Faz uma requisição para a API do Sisman para obter a lista de usuários.
  // O parâmetro `accessTokenSisman` é usado para autenticar a requisição.
  // A opção `cache: 'no-store'` garante que os dados não sejam armazenados em cache,
  // assegurando que a resposta seja sempre a mais atualizada.
  // A função `fetchApiSisman` é um wrapper para a função `fetch` do Next.js,
  // que já configura os cabeçalhos e a URL base da API.
  const response = await fetchApiSisman('/users', accessTokenSisman, {
    cache: 'no-store'
  });
  const data = await response.json();

  logger.info(
    `(Server Action) getUsers: Returning ${data.length} users from API.`
  ); // Registra a quantidade de usuários retornados pela API.

  return data as IUserList[];
}

export async function getRefreshedUsers() {
  logger.info(
    '(Server Action) refreshUsersData: Called by client, fetching new data...'
  );

  // Revalida o caminho da página de usuários no cache do Next.js.
  // Isso garante que, na próxima vez que a página for acessada,
  // os dados sejam buscados novamente do servidor, refletindo quaisquer mudanças.
  // A função `revalidatePath` é fornecida pelo Next.js.
  revalidatePath(pagePath);
  logger.info(
    `(Server Action) refreshUsersData: Revalidated path "${pagePath}" for fresh data.`
  );
  logger.info(
    '(Server Action) refreshUsersData: Path revalidated, returning new data.'
  );

  // Opcionalmente, pode retornar os novos dados para o cliente
  // mas a revalidação + router.refresh() cuidará da UI.
  // Veja que já utiliza a funcão getUsers para montar um novo compomente no server com o revalidatePath,
  // logo esse retorno é apenas para mandar para o cliente, mas lá pode não ter utilidade
  // return response;
}

export async function addUser(
  // Mesmo que não o usemos ativamente, ele precisa estar na assinatura.
  // O tipo do estado anterior deve corresponder ao tipo de retorno da action.
  prev: unknown, // ou apenas CreateUserActionResult se initialFormState for compatível
  formData: FormData
) {
  logger.info('(Server Action) addUser: Called.');
  logger.debug(
    '(Server Action) addUser: Received form data:',
    formDataToObject(formData)
  );

  // Inicia um bloco `try...catch` para lidar com possíveis erros durante o processo de adição de usuário.
  try {
    // Converte os dados do `FormData` para um objeto JavaScript simples.
    const rawData = formDataToObject<IUserAdd>(formData);

    // Valida os dados brutos usando o esquema `userFormSchemaOnServer` definido em `users-validation-form.ts`.
    // O método `safeParse` retorna um objeto com uma propriedade `success` indicando se a validação foi bem-sucedida.
    const validationResult = userFormSchema.safeParse(rawData);

    // Se a validação falhar, entra neste bloco.
    if (!validationResult.success) {
      // Cria um objeto para armazenar os erros de validação por campo.
      const fieldMeta: Partial<
        Record<keyof IUserAdd, { errorsFieldsServer: string[] }>
      > = {};

      // Itera sobre os erros de validação e os organiza por campo.
      validationResult.error.issues.forEach((err) => {
        const pathKey = err.path.join('.') as keyof IUserAdd;
        // Garante que fieldMeta[pathKey] exista e tenha uma propriedade 'errors' como array.
        if (!fieldMeta[pathKey]) {
          fieldMeta[pathKey] = { errorsFieldsServer: [] };
        }
        // Agora é seguro adicionar a mensagem de erro, pois fieldMeta[pathKey].errors existe.
        fieldMeta[pathKey]!.errorsFieldsServer.push(err.message);
      });

      const errorsFieldsServer: Partial<Record<keyof IUserAdd, string[]>> = {};

      validationResult.error.issues.forEach((err) => {
        const pathKey = err.path.join('.') as keyof IUserAdd;
        if (!errorsFieldsServer[pathKey]) {
          errorsFieldsServer[pathKey] = [];
        }
        errorsFieldsServer[pathKey]!.push(err.message);
      });

      logger.warn(
        '(Server Action) addUser: Form validation failed on server-side.',
        fieldMeta
      );
      // Retorna um objeto indicando que o envio falhou e incluindo mensagens de erro, dados submetidos e informações sobre os campos com erro.

      return {
        isSubmitSuccessful: false,
        // errorsServer: [
        //   'Favor, corrigir os campos com indicações de erro marcadas em vermelho.',
        //   'Em seguida tente novamente.'
        // ],
        errorsFieldsServer: errorsFieldsServer,
        message: 'Falha de validação do formulário: server-side',
        // fieldMeta: fieldMeta,
        submittedData: formDataToObject(formData) // Retorna os dados submetidos para correção
      };
    }

    // Se a validação for bem-sucedida, os dados validados são extraídos do resultado.
    const validatedData = validationResult.data;
    logger.info(
      '(Server Action) addUser: Form data validated successfully on server-side.'
    );

    // Obtém o token de acesso do Sisman. Apenas usuários autenticados com permissões adequadas podem adicionar usuários.
    const accessTokenSisman = await getSismanAccessToken();

    // Faz uma requisição para a API do Sisman para criar um novo usuário.
    // Utiliza o método POST e envia os dados validados no corpo da requisição como JSON.
    // O token de acesso é incluído no cabeçalho para autenticação.
    // A função `fetchApiSisman` é usada para facilitar a comunicação com a API.
    // A resposta da API é esperada conter os dados do usuário criado.

    const response = await fetchApiSisman('/users', accessTokenSisman, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validatedData)
    });

    // Extrai os dados do usuário criado da resposta da API.
    const createdUserData = await response.json();
    logger.info(
      '(Server Action) addUser: User created successfully via API.',
      createdUserData

      // Cria um objeto com o resultado da ação, indicando sucesso, incluindo os dados do usuário criado, os dados submetidos e uma mensagem de sucesso.
    );

    const createUserActionResult: IActionResultForm<IUserAdd> = {
      isSubmitSuccessful: true,
      createdData: createdUserData,
      submittedData: formDataToObject(formData),
      message: 'User created successfully!'
    };

    return createUserActionResult;

    // Inicia o bloco `catch` para capturar erros que ocorram durante a execução do bloco `try`.
  } catch (error) {
    // Verifica se o erro é uma instância de `SismanApiError`, indicando um erro específico da API do Sisman.
    if (error instanceof SismanApiError) {
      // Trata erros conhecidos da API para fornecer uma melhor experiência ao usuário.
      // Por exemplo, um erro de conflito (409) pode indicar uma tentativa de criar um usuário com um login já existente.
      logger.error(
        `Erro conhecido: Status: ${error.statusCode}, Type: ${error.errorType}, API Msg: ${error.apiMessage}`
      );
      // Se o erro for um conflito (409), retorna um resultado indicando falha, incluindo a mensagem de erro da API e os dados submetidos.
      if (error.statusCode === 409) {
        const createUserActionResult: IActionResultForm<IUserAdd> = {
          isSubmitSuccessful: false,
          errorsServer: [error.apiMessage],
          submittedData: formDataToObject(formData),
          message: 'Conflito com registro existente'
          // Retorna para a tela para que o usuário possa corrigir as informações
        };

        //retorna para a tela para que o usuário possa corrigir as informações
        return createUserActionResult;
      }

      //vai para a captura de erro do nextjs mais próxima
      throw error;
      // Lança o erro para ser capturado pelo manipulador de erros global do Next.js.
    }

    // Some other error occurred while validating your form
    throw error;
    // Se o erro não for um `SismanApiError`, lança o erro para ser tratado por um manipulador de erros mais genérico.
  }
}
