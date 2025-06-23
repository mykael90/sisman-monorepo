# =========================================================================
# ESTÁGIO 1: O Construtor (Builder)
# =========================================================================
FROM node:23-slim AS builder

# atualizar e instalar pacotes
RUN apt update && apt install -y openssl procps

# instalar pnpm 10.0.0 globally
RUN npm install -g pnpm@10.0.0

# Mude para o usuário 'node' ANTES de criar ou definir o WORKDIR.
# O WORKDIR criará o diretório se ele não existir, e ele será de propriedade do 'node'.
USER node

# Defina o diretório de trabalho. Agora ele pertence ao usuário 'node'.
WORKDIR /home/node/sisman-monorepo/

# 1. Copia os arquivos de configuração do workspace e lockfile da raiz
#    Use --chown para garantir que os arquivos sejam de propriedade de 'node' imediatamente.
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Copia os manifestos de cada pacote
#    Também use --chown para esses diretórios/arquivos.
COPY --chown=node:node apps/backend/package.json ./apps/backend/
COPY --chown=node:node apps/frontend/package.json ./apps/frontend/
COPY --chown=node:node apps/scraping-api/package.json ./apps/scraping-api/
COPY --chown=node:node packages/prisma/package.json ./packages/prisma/
COPY --chown=node:node packages/types/package.json ./packages/types/
# ... e assim por diante para cada pacote

# 3. Instale as dependências. O pnpm agora pode criar node_modules.
RUN pnpm install --frozen-lockfile

# 4. Copie o resto do código-fonte (o arquivo .dockerignore já deve estar configurado)
#    Garante que todo o código-fonte também seja de propriedade do usuário 'node'.
COPY --chown=node:node . .

# 5. Rode o build para as aplicações específicas que você quer na imagem final
# O filtro garante que apenas as aplicações especificadas e suas dependências internas sejam construídas
RUN pnpm --filter sisman-backend run build
RUN pnpm --filter scraping-api run build
RUN pnpm --filter sisman-frontend run build


# =========================================================================
# ESTÁGIO 2: A Imagem Final de Produção (com PM2)
# =========================================================================
FROM node:23-slim AS production

# atualizar e instalar pacotes
RUN apt update && apt install -y openssl procps

# ATENÇÃO: pnpm não é necessário na imagem de produção, pois as dependências já foram instaladas e os builds feitos.
# Isso ajuda a manter a imagem final menor.
# RUN npm install -g pnpm@10.0.0

# Instala o PM2 globalmente
RUN npm install -g pm2@6.0.8

# Mude para o usuário 'node' ANTES de definir o WORKDIR e copiar os arquivos.
USER node

# Defina o diretório de trabalho. Ele será de propriedade do 'node'.
WORKDIR /home/node/sisman-monorepo/

# Copia o nosso arquivo de configuração do PM2 para dentro da imagem
COPY --chown=node:node ecosystem.config.js .

# Copia os arquivos de configuração da raiz do monorepo (necessário para o PM2 e scripts de inicialização)
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/package.json ./package.json
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/pnpm-workspace.yaml ./pnpm-workspace.yaml
# pnpm-lock.yaml não é estritamente necessário para runtime, mas pode ser copiado se houver alguma lógica que dependa dele.

# ATENÇÃO: Para pnpm, você deve copiar o diretório node_modules PRINCIPAL
# que contém o cache `.pnpm` e os symlinks. Se você tentar copiar node_modules
# de pacotes individuais, os symlinks apontarão para caminhos que não existem
# na nova imagem. Copie o `node_modules` da raiz do monorepo.
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/node_modules ./node_modules

# Copia os artefatos de build e os package.json de cada app/pacote
# Use o caminho ABSOLUTO da stage 'builder' para garantir que os arquivos sejam encontrados.

# Backend
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/backend/package.json ./apps/backend/

# Frontend
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/frontend/package.json ./apps/frontend/

# Scraping API
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/scraping-api/dist ./apps/scraping-api/dist
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/apps/scraping-api/package.json ./apps/scraping-api/

# Copie pacotes de dependências compartilhadas ou pacotes que contêm código runtime
# Ex: packages/prisma pode ter o cliente gerado; packages/types pode ter interfaces usadas em runtime.
# Se esses pacotes contêm código que os outros apps usam em runtime, copie-os.
# Caso contrário, se forem apenas para o build-time ou types, podem não ser necessários.
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/packages/prisma ./packages/prisma
COPY --from=builder --chown=node:node /home/node/sisman-monorepo/packages/types ./packages/types

# Comando final para iniciar o PM2 em modo "no-daemon",
# que mantém o container rodando.
CMD ["pm2-runtime", "start", "ecosystem.config.js"]


# =========================================================================
# OBSERVAÇÃO IMPORTANTE
# =========================================================================

# A filosofia do Docker prega o princípio de "um processo por container". Isso significa que, idealmente, cada container faz uma única coisa (roda um servidor web, um banco de dados, etc.). As vantagens disso são:

# Confiabilidade e Isolamento: Se a webapp1 travar por um bug, ela não derruba a webapp2. Em um container compartilhado, um erro fatal em um app pode parar o processo principal e matar o container inteiro.
# Simplicidade de Gerenciamento: É mais fácil monitorar a saúde, ver os logs e escalar um container que faz apenas uma coisa.
# Escalabilidade Granular: Se a webapp1 receber 10x mais tráfego que a webapp2, você pode escalar apenas os containers da webapp1, em vez de escalar o container "combo".
# Por que então fazer isso?
# Apesar dos pontos acima, para ambientes de desenvolvimento, servidores de "staging", projetos internos ou cenários de produção de baixo tráfego onde a economia de RAM é a prioridade máxima, rodar múltiplos processos em um container é uma solução prática e aceitável.

#Considerando a necessidade de economia RAM vamos rodar mais de um processo no mesmo container.
