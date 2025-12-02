#!/bin/bash

# Execute assim: bash start-db.sh parametro_senha

echo "Executando somente o container do banco de dados mariadb do SISMAN"

# Verifica se a senha foi fornecida
if [ -z "$1" ]; then
  echo "Uso: $0 <senha-do-root>"
  exit 1
fi

ROOT_PASSWORD="$1"

docker run -d \
  --name "db-sisman-dev-only" \
  -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD="$ROOT_PASSWORD" \
  -v "$(pwd)/_data/mariadb-data/development:/var/lib/mysql" \
  --restart unless-stopped \
  mariadb:11.5.2-noble


