FROM node:23-slim

# atualizar e instalar pacotes
RUN apt update && apt install -y openssl procps

# instalar pnpm 10.0.0 globally
RUN npm install -g pnpm@10.0.0


USER node

RUN mkdir /home/node/sisman-monorepo/
WORKDIR /home/node/sisman-monorepo/
CMD ["/home/node/sisman-monorepo/.docker/start.sh"]