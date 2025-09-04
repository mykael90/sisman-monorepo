#!/bin/bash

# =========================================================================
#  Configuração de Segurança do Script
# =========================================================================
# 'set -e' faz o script sair imediatamente se qualquer comando falhar.
# Isso é VITAL para garantir que não iniciemos os aplicativos se a migração
# ou o seeding do banco de dados falharem.
set -e

echo "Entrou no start-prod.sh"

# =========================================================================
#  Aguardar o Banco de Dados
# =========================================================================
# Use as variáveis de ambiente, mas defina um valor padrão caso não existam.
DB_HOST=${DB_HOST:-db-sisman-prod}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USERNAME:-root}        # ALERTA: Defina esta variável de ambiente em produção! (usando DB_USERNAME para consistência com sua URL)
DB_PASSWORD=${DB_PASSWORD:-}    # ALERTA: Defina esta variável de ambiente em produção!

# As variáveis DB_SCHEMA e ENV são usadas para construir o nome completo do banco de dados
DB_SCHEMA=${DB_SCHEMA:-sisman_db} # Nome base do schema/banco de dados (ex: 'sisman_db')
ENV=${ENV:-production}                 # Suffix do ambiente (ex: 'prod', 'dev', ou vazio para o padrão)

# Constrói o nome completo do banco de dados para a conexão MySQL
ACTUAL_DB_NAME="${DB_SCHEMA}${ENV}"

echo "Aguardando o banco de dados ($DB_HOST:$DB_PORT) ficar disponível..."

while ! (timeout 1 bash -c "true &>/dev/null </dev/tcp/$DB_HOST/$DB_PORT")
do
  echo "Banco de dados ainda indisponível. Tentando novamente em 1 segundo..."
  sleep 1
done

echo "Banco de dados está pronto."

# =========================================================================
#  Preparação do Banco de Dados (Migração e Seeding)
# =========================================================================

echo "Verificando se o banco de dados '$ACTUAL_DB_NAME' já está estruturado e povoado com 'users' via Prisma..."

# Executa o script TypeScript (transpilado para JS) para verificar o estado do banco de dados.
# O script 'check-db-seeded' sairá com 0 se a tabela 'User' existir e tiver registros.
# O script sairá com 1 se a tabela 'User' não existir ou estiver vazia.
if (cd apps/backend && pnpm check-db-seeded); then
  echo "Banco de dados já estruturado e possui dados (tabela 'User' não vazia). Pulando db:push e seeding."
else
  echo "Banco de dados precisa de estruturação e/ou povoamento."

  echo "--> Passo 1: Estruturando o banco de dados com 'pnpm db:push --accept-data-loss'..."
  # Adicione --accept-data-loss para forçar a aplicação das mudanças,
  # pois em um banco de dados novo/vazio, não há dados para perder.
  # Em produção com dados EXISTENTES e migrações, o RECOMENDADO é usar `prisma migrate deploy`.
  (cd packages/prisma && pnpm db:push --accept-data-loss)
  echo "Estrutura do banco de dados aplicada com sucesso."

  echo "--> Passo 2: Povoando o banco de dados com 'pnpm seed:prod'..."
  # Executa o seeder a partir do diretório do backend.
  (cd apps/backend && pnpm seed:prod)
  echo "Banco de dados povoado com sucesso."
fi

# =========================================================================
#  Iniciando as Aplicações
# =========================================================================

echo "Preparação finalizada. Iniciando os serviços com PM2..."

# 'exec' substitui o processo do shell pelo do pm2-runtime.
# Isso garante que o PM2 se torne o processo principal (PID 1) do contêiner,
# o que é a prática recomendada para o Docker.
exec pm2-runtime start ecosystem.config.js