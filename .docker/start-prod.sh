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

echo "--> Passo 1: Estruturando o banco de dados com 'pnpm db:push'..."
# Executa o comando dentro de um subshell para não alterar o diretório atual do script.
(cd packages/prisma && pnpm db:push)
echo "Estrutura do banco de dados aplicada com sucesso."


echo "--> Passo 2: Povoando o banco de dados com 'pnpm seed'..."
# Da mesma forma, executa o seeder a partir do diretório do backend.
(cd apps/backend && pnpm seed)
echo "Banco de dados povoado com sucesso."


# =========================================================================
#  Iniciando as Aplicações
# =========================================================================

echo "Preparação finalizada. Iniciando os serviços com PM2..."

# 'exec' substitui o processo do shell pelo do pm2-runtime.
# Isso garante que o PM2 se torne o processo principal (PID 1) do contêiner,
# o que é a prática recomendada para o Docker.
exec pm2-runtime start ecosystem.config.js