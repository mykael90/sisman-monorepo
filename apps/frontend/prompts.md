Instanciar um objeto logger da classe import Logger from '@/lib/logger' e
implementar logs representativos, didáticos e bem apresentados para este
arquivo. Não altere a lógica do código.

Utilizando objeto logger da classe import Logger from '@/lib/logger', implemente
logs representativos, didáticos e bem apresentados para este arquivo.Não altere
a lógica do código.

implemente comentários representativos, didáticos e bem formatados para este
arquivo. pode usar como base, se necessário, o conteúdo dos comentários
existentes. Não altere a lógica do código.

Usando o componente atual @... crie um componente espelho como skeleton.

Para essa página gere uma melhor estilização, alterando padding e margins quando
necessário, e se aproveitando das cores utilizadas no projeto.

utilizando a mesma lógica em user criar a estrutura de arquivos para role,
utilizando a mesma lógica e realizando as adaptações necessárias. Eu já criei o
arquivo de tipos role-types.ts, o arquivo de actions role-actions.ts, e
validação role-form-validation.ts para facilitar o processo. A estrutura final
deve ser exatamente conforme abaixo:  
role  
├── add  
│ └── page.tsx  
├── \_components  
│ ├── add  
│ │ ├── role-add.tsx  
│ ├── edit  
│ │ └── role-edit.tsx  
│ ├── form  
│ │ ├── role-form.tsx  
│ │ └── role-form-validation.ts  
│ └── list  
│ ├── role-columns.tsx  
│ ├── role-filters.tsx  
│ ├── role-list.tsx  
│ └── role-table.tsx  
├── edit  
│ └── [id]  
│ └── page.tsx  
├── layout.tsx  
├── @modal  
│ ├── (.)add  
│ │ └── page.tsx  
│ ├── default.tsx  
│ └── (.)edit  
│ └── [id]  
│ └── page.tsx  
├── page.tsx  
├── role-actions.ts  
└── role-types.ts
