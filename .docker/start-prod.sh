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
ENV=${ENV:-prod}                 # Suffix do ambiente (ex: 'prod', 'dev', ou vazio para o padrão)

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

# Exporte a senha para o comando mysql para maior segurança (não aparece em ps -ef)
export MYSQL_PWD=$DB_PASSWORD

# Verificamos a existência de uma tabela chave (ex: 'users') no banco de dados.
# Se ela existir, presumimos que o banco de dados já foi inicializado e populado.
echo "Verificando se o banco de dados '$ACTUAL_DB_NAME' já está estruturado e possui dados..."

# O comando 'mysql -N -s -e "..."' executa uma query:
# -N: Não mostra nomes de colunas.
# -s: Modo silencioso (sem bordas ou cabeçalhos extras).
# A query tenta selecionar '1' (apenas um valor qualquer) da tabela 'users'.
# Se a tabela 'users' existe e tem pelo menos um registro, a query será bem-sucedida e retornará '1'.
# Se a tabela não existe, o comando mysql irá falhar silenciosamente (2>/dev/null) ou retornar um erro.
# Usamos `SELECT 1 FROM \`users\` LIMIT 1` para verificar a existência da tabela.
# É importante usar `\`users\`` para escapar o nome da tabela caso seja uma palavra reservada ou contenha caracteres especiais.

if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -D"$ACTUAL_DB_NAME" -N -s -e "SELECT 1 FROM \`users\` LIMIT 1" 2>/dev/null; then
  echo "Tabela 'users' encontrada no banco de dados '$ACTUAL_DB_NAME'. Pulando migração e seeding."
else
  echo "Tabela 'users' NÃO encontrada no banco de dados '$ACTUAL_DB_NAME' ou banco de dados vazio/novo."
  echo "Executando estruturação do banco de dados e povoamento inicial..."

  echo "--> Passo 1: Estruturando o banco de dados com 'pnpm db:push'..."
  # Executa o comando dentro de um subshell para não alterar o diretório atual do script.
  (cd packages/prisma && pnpm db:push)
  echo "Estrutura do banco de dados aplicada com sucesso."

  echo "--> Passo 2: Povoando o banco de dados com 'pnpm seed'..."
  # Da mesma forma, executa o seeder a partir do diretório do backend.
  (cd apps/backend && pnpm seed:prod)
  echo "Banco de dados povoado com sucesso."
fi

# Desexporta a senha para maior segurança
unset MYSQL_PWD


# =========================================================================
#  Iniciando as Aplicações
# =========================================================================

echo "Preparação finalizada. Iniciando os serviços com PM2..."

# 'exec' substitui o processo do shell pelo do pm2-runtime.
# Isso garante que o PM2 se torne o processo principal (PID 1) do contêiner,
# o que é a prática recomendada para o Docker.
exec pm2-runtime start ecosystem.config.js