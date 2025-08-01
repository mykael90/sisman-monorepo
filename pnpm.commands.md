## Comandos pnpm

Instalar todos os pacotes de todos os workspaces:
`pnpm install`

Forçar a reinstalação de todos os pacotes de todos os workspaces:
`pnpm install --force`


Forçar a reinstalação de pacotes de um workspace específico:
`pnpm install --force --filter <workspace-name>`


- No PNPM, você pode adicionar um pacote a um workspace específico usando o seguinte comando:  
`pnpm add <package-name> --filter <workspace-name>`


- Exemplo:
Se você tem um workspace chamado sisman-backend e deseja instalar lodash apenas nele:  
`pnpm add lodash --filter sisman-backend`

Isso adicionará lodash apenas ao workspace sisman-backend, sem afetar os outros pacotes no monorepo.

- Verificando Workspaces:
Caso não tenha certeza do nome do workspace, você pode listar os workspaces disponíveis com:  
`pnpm list --depth=-1`

Clear the pnpm cache:  
`pnpm store prune`

Running executables inside your downloaded dependencies

For example `npx jest`.

The pnpm equivalent is `pnpm exec jest`.

Running executable commands in packages you want to download transiently

For example `npx create-react-app my-app`.

The pnpm equivalent of this is `pnpm dlx create-react-app my-app`.

`pnpm dlx shadcn@latest add label`

Isso ajuda a confirmar o nome correto do workspace antes de instalar o pacote 🚀

Novo recurso Nest
`pnpm exec nest g res`
