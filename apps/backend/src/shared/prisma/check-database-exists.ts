// Path: apps/backend/src/utils/check-database-exists.ts

import { PrismaClient } from '@sisman/prisma';

const prisma = new PrismaClient();
const logger = console;

async function checkDatabaseExistsAndIsSeeded() {
  logger.log(
    'Attempting to check database schema and data presence via Prisma...'
  );
  try {
    // Tentamos contar os registros na tabela 'User'.
    // Esta é uma boa verificação porque:
    // 1. Se a tabela 'User' não existir, Prisma lançará um erro (indicando que db:push é necessário).
    // 2. Se a tabela 'User' existir mas estiver vazia, retornará 0 (indicando que seed é necessário).
    // 3. Se a tabela 'User' existir e tiver registros (> 0), significa que o banco de dados está estruturado e semeado.
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      logger.log(
        `Tabela 'User' encontrada e contém ${userCount} registros. Banco de dados está estruturado e semeado.`
      );
      process.exit(0); // Sucesso: banco de dados está pronto
    } else {
      logger.log(
        `Tabela 'User' encontrada, mas está vazia (${userCount} registros). Banco de dados precisa ser semeado.`
      );
      process.exit(1); // Falha: precisa de seed
    }
  } catch (error: any) {
    // Se ocorrer um erro aqui, a causa mais provável é que a tabela 'User' não existe.
    // Isso indica que o 'db:push' precisa ser executado para criar o esquema.
    logger.error(
      "Erro ao verificar o banco de dados (provavelmente tabela 'User' não encontrada ou problema de conexão):",
      error.message
    );

    // Podemos procurar por mensagens de erro específicas do Prisma/Driver para "tabela não existe"
    // Em MySQL, o erro geralmente se parece com "Error 1146: Table 'db_name.table_name' doesn't exist"
    if (
      error.message &&
      error.message.includes("Table '") &&
      error.message.includes("doesn't exist")
    ) {
      logger.log(
        "Esquema do banco de dados (especificamente a tabela 'User') não encontrado. Executando db:push e seed."
      );
    } else {
      logger.error(
        'Um erro inesperado ocorreu durante a verificação do banco de dados. Assumindo que db:push e seed são necessários.',
        error
      );
    }
    process.exit(1); // Falha: precisa de db:push e/ou seed
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a função de verificação
checkDatabaseExistsAndIsSeeded();
