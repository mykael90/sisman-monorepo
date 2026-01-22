## Dívidas Técnicas

Esta é uma lista de dívidas técnicas conhecidas no projeto.

### Backend

1. Problema de N+1 em Anexos

    - **Problema:** A recuperação de anexos em listagens pode causar o problema de consultas N+1, impactando a performance do banco de dados à medida que o volume de dados cresce.
    - **Solução:** Implementar o padrão `DataLoader` para interceptar e agrupar as solicitações de anexos em uma única query por ciclo de vida da requisição.
    - **Benefício:** Redução drástica de overhead no banco de dados em endpoints de listagem (REST), garantindo escalabilidade e performance.

1. DTOs Complexos

    - **Problema:** O backend espera em muitos modelos (MaterialPickingOrder, MaterialWithdraw, etc) DTOs complexos, como: `data: {material :{id: int}}` ao invés de `data:{materialId:int}`. Isso aumenta a complexidade do código do frontend e a carga de dados desnecessariamente. Essa abordagem também dificulta o envio de anexos, pois o `FormData` de requisições `multipart/form-data` possui uma estrutura plana ("flat"), o que conflita com a necessidade de aninhar objetos JSON.
    - **Solução:** Refatorar os DTOs e os respectivos controllers para aceitar Ids diretos (ex: `materialId: int`) para relações.
    - **Benefício:** Simplificação do código do frontend, redução da carga de dados e uma API mais limpa e intuitiva.

1. Respostas de listagens com muitos aninhamentos.
