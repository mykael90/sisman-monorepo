#!/bin/bash
echo "Entrou no start-prod.sh"

# Diretório e nome do serviço de banco de dados, conforme definido no seu docker-compose.yml
DB_HOST="db-sisman-prod"
DB_PORT="3306"

echo "Aguardando o banco de dados ($DB_HOST:$DB_PORT) ficar disponível..."

# Loop para esperar a porta do banco de dados estar acessível
# A mágica está aqui: (timeout 1 bash -c '</dev/tcp/$DB_HOST/$DB_PORT')
# O 'timeout' é importante para não ficar preso indefinidamente em uma única tentativa.
# Redirecionamos o stderr para /dev/null para não poluir o log com "Connection refused".
while ! (timeout 1 bash -c "true &>/dev/null </dev/tcp/$DB_HOST/$DB_PORT")
do
  echo "Banco de dados ainda indisponível. Tentando novamente em 1 segundo..."
  sleep 1
done

echo "Banco de dados está pronto. Iniciando os serviços com PM2..."

# Agora que o DB está pronto, inicie os aplicativos com pm2-runtime.
# Usamos exec para que o pm2-runtime se torne o processo principal (PID 1),
# garantindo que o contêiner continue rodando e receba os sinais corretamente.
exec pm2-runtime start ecosystem.config.js
