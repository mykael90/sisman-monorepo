import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException, // Para erros inesperados
  Logger // Assumindo que cada serviço terá sua própria instância de logger
} from '@nestjs/common';
import { Prisma } from '@sisman/prisma'; // Importar o namespace Prisma

// Não é mais uma classe de serviço, mas uma função utilitária ou um método estático
// Se for uma função utilitária, você pode colocá-la em um arquivo separado.
// Se for um método em uma classe base de serviço, pode ser protected.

/**
 * Manipulador genérico para erros conhecidos do Prisma Client.
 * Lança exceções HTTP apropriadas do NestJS.
 *
 * @param error O erro capturado.
 * @param logger Instância do Logger para registrar detalhes do erro.
 * @param entityName Nome amigável da entidade sendo manipulada (ex: "Usuário", "Produto").
 *                   Usado para mensagens de erro mais claras. Opcional.
 * @param contextInfo Informações contextuais adicionais para logging. Opcional.
 */
export function handlePrismaError(
  error: any,
  logger: Logger, // Cada serviço passará seu logger
  entityName: string = 'registro', // Nome genérico se não especificado
  contextInfo?: Record<string, any> // Para IDs, DTOs, etc.
): void {
  // Retorna void porque lança exceções
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn(
      `Prisma Known Request Error: Code ${error.code}, Meta: ${JSON.stringify(error.meta)}`,
      error.stack,
      contextInfo
    );

    switch (error.code) {
      case 'P2000':
        // O valor fornecido para uma coluna é muito longo.
        // error.meta.column_name
        throw new BadRequestException(
          `O valor fornecido para o campo '${error.meta?.column_name}' é muito longo para o ${entityName}.`
        );
      case 'P2001':
        // O registro pesquisado na condição where (entity.findUniqueOrThrow) não existe.
        // Este é mais para findUniqueOrThrow, P2025 é mais comum para updates/deletes.
        throw new NotFoundException(
          `O ${entityName} especificado não foi encontrado (condição where).`
        );
      case 'P2002':
        // Violação de restrição de unicidade.
        // error.meta.target é um array de campos que causaram a falha.
        let uniqueFields = 'campo(s) único(s)';
        const target = error.meta?.target;
        if (Array.isArray(target)) {
          uniqueFields = (target as string[]).join(', ');
        } else if (typeof target === 'string') {
          uniqueFields = target;
        }
        throw new ConflictException(
          `Já existe um ${entityName} com este(s) campo: ${uniqueFields}.`
        );
      case 'P2003':
        // Violação de restrição de chave estrangeira.
        // error.meta.field_name é o campo que causou a falha.
        // Ex: tentando criar um Post com um authorId que não existe em User.
        throw new BadRequestException(
          `Falha na restrição de chave estrangeira no campo '${error.meta?.field_name || error.meta?.constraint}' ao processar o ${entityName}. O registro relacionado pode não existir.`
        );
      case 'P2004':
        // A constraint check failed on the database
        // error.meta.constraint_name
        throw new BadRequestException(
          `Uma verificação de restrição ('${error.meta?.constraint_name}') falhou no banco de dados para o ${entityName}.`
        );
      case 'P2011':
        // Violação de restrição NOT NULL.
        // error.meta.constraint (ex: "Post_title_key")
        // Pode ser útil detalhar quais campos são nulos, mas error.meta é limitado aqui.
        // A mensagem do Prisma "Null constraint violation on the fields: (`field1`, `field2`)" é útil.
        // A mensagem padrão do Prisma já é boa, mas podemos personalizar:
        throw new BadRequestException(
          `Um ou mais campos obrigatórios para o ${entityName} não foram preenchidos.`
        );
      case 'P2014':
        // A mudança que você está tentando fazer violaria a relação requerida '...' entre o modelo A e o modelo B.
        // error.meta.relation_name, model_a_name, model_b_name
        throw new BadRequestException(
          `A operação no ${entityName} violaria a relação requerida '${error.meta?.relation_name}' com o modelo '${error.meta?.model_b_name}'.`
        );
      case 'P2025':
        // Operação falhou porque depende de um ou mais registros que eram necessários, mas não foram encontrados.
        // (Ex: "Record to update/delete not found", ou um ID em connect/set não existe).
        // O 'cause' no meta pode dar mais detalhes.
        let messageP2025 = `Não foi possível encontrar um ou mais ${entityName}s ou registros relacionados necessários para esta operação.`;
        const cause = (error.meta?.cause as string)?.toLowerCase();
        if (cause?.includes('record to update not found')) {
          messageP2025 = `O ${entityName} que você está tentando atualizar não foi encontrado.`;
          throw new NotFoundException(messageP2025);
        } else if (cause?.includes('record to delete not found')) {
          messageP2025 = `O ${entityName} que você está tentando deletar não foi encontrado.`;
          throw new NotFoundException(messageP2025);
        }
        // Se não for um "record to update/delete not found", pode ser um ID inválido em connect/set
        throw new BadRequestException(
          messageP2025 + ' Verifique os IDs fornecidos.'
        );

      // Adicionar mais casos conforme necessário
      // P2021: A tabela não existe no banco de dados. (Erro de setup)
      // P2022: A coluna não existe no banco de dados. (Erro de setup)

      default:
        // Para outros erros conhecidos do Prisma não explicitamente tratados.
        logger.error(
          `Erro Prisma não tratado especificamente: ${error.code}`,
          error.stack,
          contextInfo
        );
        throw new BadRequestException(
          `Ocorreu um erro ao processar sua solicitação para o ${entityName}. (Código Prisma: ${error.code})`
        );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Erro de validação do input pelo Prisma Client (ex: tipo errado, campo faltando no objeto de dados).
    // A mensagem de erro do Prisma já é bastante descritiva.
    logger.warn(
      `Prisma Validation Error: ${error.message}`,
      error.stack,
      contextInfo
    );
    throw new BadRequestException(
      `Erro de validação nos dados fornecidos para o ${entityName}: ${error.message.split('\n').pop()?.trim() || 'Verifique os campos.'}` // Tenta pegar a última linha da mensagem que é mais útil
    );
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    logger.error(
      `Prisma Rust Panic Error! ${error.message}`,
      error.stack,
      contextInfo
    );
    // Este é um erro grave, indica um bug no motor do Prisma.
    throw new InternalServerErrorException(
      `Ocorreu um erro crítico interno ao processar sua solicitação para o ${entityName}. A equipe foi notificada.`
    );
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error(
      `Prisma Initialization Error: ${error.message}`,
      error.stack,
      contextInfo
    );
    throw new InternalServerErrorException(
      `Falha ao inicializar a conexão com o banco de dados para o ${entityName}.`
    );
  }
  // Se não for um erro conhecido do Prisma, não o manipule aqui, deixe que outros catch o peguem
  // ou que seja lançado como um erro não tratado (que o NestJS pode converter para 500).
  // No entanto, se esta função é o ponto final de tratamento de erros antes de responder ao cliente,
  // você pode querer lançar um InternalServerErrorException genérico.
  // A decisão depende de como você estrutura seus blocos try/catch.
  // A função como está agora *somente* lida com erros do Prisma.
  // Se o erro não for do Prisma, ele será relançado pelo `throw error` no `catch` do serviço.
}
