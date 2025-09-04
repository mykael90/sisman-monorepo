# SISMAN Monorepo

[![Status da Build](https://img.shields.io/github/actions/workflow/status/mykael90/sisman-monorepo/ci.yml?branch=main&style=for-the-badge)](https://github.com/mykael90/sisman-monorepo/actions)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg?style=for-the-badge)](/LICENSE)

Um monorepo para o projeto Sisman, utilizando PNPM Workspaces para gerenciar múltiplos pacotes e aplicações (Next.js, NestJS) de forma coesa.

## 🚀 Sobre o Projeto

Este repositório contém o código-fonte para:

* **`apps/frontend`**: A aplicação web construída com Next.js.
* **`apps/backend`**: A API REST construída com NestJS, Prisma e MariaDB.
* **`apps/scraping-api`**: A API REST construída com NestJS para transformar dados não estruturados de páginas HTML em dados estruturados JSON.
* **`packages/prisma`**: Abriga o schema do Prisma e o cliente gerado. Atua como a **fonte única de verdade** para os tipos de dados do banco, sendo compartilhado massivamente entre o backend e o frontend para garantir consistência.
* **`packages/types`**: Reservado para uso futuro, com o objetivo de desacoplar tipos de dados específicos da aplicação do schema do banco de dados.

Todo o ambiente, tanto de desenvolvimento quanto de produção, é containerizado com Docker, garantindo consistência e eliminando a necessidade de instalar dependências localmente.

## 🏛️ Nota sobre a Arquitetura

Diferente da prática comum de "um processo por container", este projeto executa tanto o frontend (Next.js) quanto o backend (Nest.js) **dentro de um único container**, tanto em desenvolvimento quanto em produção.

Esta foi uma **decisão intencional para otimizar o uso de recursos** em ambientes com memória e processamento limitados. Para gerenciar ambos os processos de forma confiável dentro do mesmo container, utilizamos o **PM2**, orquestrado pelo arquivo `ecosystem.config.js`.

## ✨ Tecnologias

* **Gerenciador de Pacotes:** [PNPM Workspaces](https://pnpm.io/)
* **Frontend:** [Next.js](https://nextjs.org/)
* **Backend:** [NestJS](https://nestjs.com/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Banco de Dados:** [MariaDB](https://mariadb.org/)
* **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* **Gerenciador de Processos (Produção):** [PM2](https://pm2.keymetrics.io/)

## 📋 Pré-requisitos

Para executar este projeto, você precisará apenas de:

1. **[Docker](https://www.docker.com/get-started/)** e **[Docker Compose](https://docs.docker.com/compose/install/)**
2. **[Visual Studio Code](https://code.visualstudio.com/)**
3. A extensão **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** para VS Code.

> **Nota:** Não é necessário instalar Node.js, pnpm ou qualquer outra dependência de desenvolvimento na sua máquina local.

---

## 🛠️ Ambiente de Desenvolvimento

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento.

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/mykael90/sisman-monorepo.git
cd sisman-monorepo
```

### Passo 2: Configurar Variáveis de Ambiente

As variáveis de ambiente são gerenciadas pelo `docker-compose.override.yaml` e necessitam de um arquivo `.env` na raiz do projeto.

```bash
# Crie um arquivo .env a partir do exemplo (.env.example)
# ou crie um novo arquivo .env na raiz do projeto.
# Configure as variáveis, especialmente as do banco de dados.
# Exemplo:
cp .env.example .env
```

> **Atenção:** Verifique o `docker-compose.override.yaml` para confirmar o nome e a localização exata do arquivo de ambiente esperado.

### Passo 3: Abrir no Dev Container

1. Abra a pasta do projeto `sisman-monorepo` no **Visual Studio Code**.
2. O VS Code detectará a configuração do Dev Container e exibirá uma notificação no canto inferior direito. Clique em **"Reopen in Container"**.
3. Aguarde o VS Code construir a imagem de desenvolvimento (`Dockerfile.dev`), iniciar os containers (incluindo o banco de dados) e configurar o ambiente.

### Passo 4: Instalar Dependências e Preparar o Banco

Uma vez que o ambiente esteja pronto, um terminal do VS Code será aberto *dentro* do container.

```bash
# 1. Instale todas as dependências do monorepo (por garantia, uma vez que essa etapa é realizada no build da imagem)
pnpm install

# 2. Prepare o banco de dados. Use uma das opções abaixo.

# Opção A: Executar as migrations para criar as tabelas (recomendado para desenvolvimento contínuo)
pnpm prisma:migrate:dev

# Opção B: Enviar o estado do esquema Prisma diretamente para o banco (ótimo para setup inicial)
pnpm prisma:db:push

# 3. Gere o Prisma Client
pnpm prisma:generate

# 4. Popular as tabelas com dados
pnpm backend:seed:dev
```

### Passo 5: Executar as Aplicações

Você pode iniciar as aplicações separadamente ou com um único comando, se configurado.

```bash
# Para iniciar o backend (API NestJS)
pnpm backend:dev

# Para iniciar o frontend (Next.js)
pnpm frontend:dev


# Para iniciar api-scraping (API NestJS)
pnpm scraping-api:dev
```

Pronto! O frontend estará acessível em `http://localhost:3000`, backend em `http://localhost:3080` e o scraping-api em `http://localhost:3010`. (verifique as portas nos respectivos `package.json` ou logs).

---

## 🏭 Ambiente de Produção - Construção e Utilização

O processo de construção para produção consiste em gerar uma única imagem Docker otimizada que contém as builds de todas as aplicações.

### Passo 1: Construir a Imagem Docker

Este comando utiliza o `Dockerfile` da raiz para criar uma imagem de produção multi-stage, resultando em uma imagem final leve e otimizada. É importante destacar que é realizado o build dentro da construção da imagem, dessa forma não precisa realizar o build de cada pacote previamente.

```bash
docker build -t mykael90/sisman_monorepo:1.0.0 .
```

**Enviar imagem para o Docker Hub (opcional)**

```bash
docker push mykael90/sisman_monorepo:1.0.0
```

Pré-requisitos:
Antes de executar esse comando, certifique-se de que:

* Você está logado no Docker Hub:
`docker login`
* Ele vai pedir seu username e senha/token ou fazer uma autenticação via browser.
* O nome da imagem (mykael90/sisman_monorepo) corresponde ao seu nome de usuário no Docker Hub. Se o repositório ainda não existir, o Docker Hub vai criar automaticamente no primeiro push.

### Passo 2: Configurar Variáveis de Ambiente

Garanta que as variáveis de ambiente para produção estejam corretamente configuradas. O `docker-compose.yaml` principal pode ser usado para orquestrar o container da aplicação e do banco de dados. Crie um arquivo `.env` com as credenciais de produção.

```bash
# Exemplo de arquivo .env para produção:
cp .env.example .env
```

### Passo 3: Executar com Docker Compose

A maneira mais fácil de executar o ambiente de produção (aplicação + banco de dados) é usando o `docker-compose.yaml`.

```bash
# Inicia os containers em modo detached (segundo plano)
docker-compose up -d
```

O `docker-compose` irá subir o container da aplicação a partir da imagem que você acabou de construir (se referenciada no `docker-compose.yaml`) e o container do MariaDB, conectando-os na mesma rede.

Deve ser referenciada na linha do `docker-compose.yaml` referente a imagem: ```image: mykael90/sisman_monorepo:1.0.0```

### Passo 4: Executar com Docker Run (Alternativa)

Se preferir executar o container da aplicação manualmente (assumindo que o banco de dados já está rodando e acessível):

```bash
docker run -d \
  -p 3000:3000 \
  --name sisman-app \
  --env-file ./.env \
  mykael90/sisman_monorepo:1.0.0
```

> O arquivo `ecosystem.config.js` indica que o PM2 é usado como gerenciador de processos dentro do container, o que é uma excelente prática para gerenciar aplicações Node.js em produção.

## 🏭 Ambiente de Produção - Utilização Prática (imagem do dockerHub)

Esse processo consiste em já utilizar a imagem pronta do dockerHub e simplesmente iniciar os containers.

### Passo 1: Configurar Variáveis de Ambiente

Garanta que as variáveis de ambiente para produção estejam corretamente configuradas. O `docker-compose.yaml` principal pode ser usado para orquestrar o container da aplicação e do banco de dados. Crie um arquivo `.env` com as credenciais de produção.

```bash
# Exemplo de arquivo .env para produção:
cp .env.example .env
```

### Passo 2: Criar docker-compose.yaml

```yaml
services:
  sisman-monorepo-prod:
    image: mykael90/sisman_monorepo:1.0.0 # <-- Imagem já no dockerHub (confirmar)
    container_name: sisman-monorepo-prod
    ports:
      - 3000:3000
    environment:
      ENV: ${ENV}
      TZ: America/Sao_Paulo
    env_file:
      .env
    restart: unless-stopped
    depends_on:
      - db-sisman-prod
    networks: # <-- Conectar à rede compartilhada
      - sisman_net

  db-sisman-prod:
    image: mariadb:11.5.2-noble
    container_name: ${DB_HOST}
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_SCHEMA}${ENV}
    ports:
      - 3306:3306
    env_file:
      .env
      # - ${ENV_FILE_RMQ}
      # - ${ENV_FILE_KC}
    volumes:
    - ./_data/mariadb-data/${ENV}:/var/lib/mysql
    restart: unless-stopped
    networks: # <-- Conectar à rede compartilhada
      - sisman_net

      # Define a rede compartilhada
networks:
  sisman_net:
    driver: bridge # Rede padrão do tipo bridge
```

### Passo 3: Executar com Docker Compose

A maneira mais fácil de executar o ambiente de produção (aplicação + banco de dados) é usando o `docker-compose.yaml`.

```bash
# Inicia os containers em modo detached (segundo plano)
docker-compose up -d
```

## 🏭 Ambiente de Produção - Atualização

O processo de atualização da produção consiste em reiniciar os containers com a imagem dos serviços atualizadas e realizar os migrations do banco de dados manualmente, fazendo o acesso do container através de `exec` do docker.

### Passo 1: Executar com Docker Compose com imagem atualizada

A maneira mais fácil de executar o ambiente de produção (aplicação + banco de dados) é usando o `docker-compose.yaml`.

Deve ser referenciada na linha do `docker-compose.yaml` referente a imagem atualizada: ```image: mykael90/sisman_monorepo:[tag_atualizada]```

```bash
# Inicia os containers em modo detached (segundo plano)
docker-compose up -d --build --force-recreate
```

### Passo 2: Executar migrations do banco de dados

A estrutura do banco de dados já existe, ela é criada durante o primeiro uso do serviço. Agora que é apenas uma atualização, não é disparado `pnpm db:push` nem `pnpm seed:prod`. Dessa forma, é necesário fazer as migrações manualmente a partir do container.

`docker compose exec workspace sh`

## ⚙️ Comandos Úteis (Dentro do Dev Container)

| Comando                                           | Descrição                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm install`                                    | Instala todas as dependências dos workspaces.                                  |
| `pnpm build`                                      | Executa o script `build` em todos os pacotes e apps.                           |
| `pnpm lint`                                       | Executa o linter em todo o projeto.                                            |
| `pnpm --filter <app-name> <script>`               | Executa um script (`dev`, `build`, `test`) em uma aplicação ou pacote específico. |
| `pnpm --filter sisman-backend prisma:migrate:dev`  | Aplica migrações do banco de dados no ambiente de desenvolvimento.               |
| `pnpm --filter sisman-backend prisma:studio`       | Abre a interface visual do Prisma Studio.                                      |
| `pm2 list`                                           | Lista os processos gerenciados pelo PM2.                                       |
| `pm2 stop <id\|name>`                                 | Para um processo específico.                                                   |
| `pm2 restart <id\|name>`                              | Reinicia um processo específico.                                               |

## Disparar apenas o banco de dados (porta 3307), caso exista essa necessidade

```bash
docker run -d \
  --name "db-sisman-prod-only" \
  -p 3307:"3306" \
  -e MARIADB_ROOT_PASSWORD="[DB_PASSWORD]" \
  -e MYSQL_DATABASE="sismanprod" \
  -v "$(pwd)/_data/mariadb-data/prod:/var/lib/mysql" \
  --restart unless-stopped \
  mariadb:11.5.2-noble
```
