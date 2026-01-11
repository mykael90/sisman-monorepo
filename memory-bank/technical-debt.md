## Dívida Técnica

### . Implementação do Padrão DataLoader para Anexos

- **Problema:** Atualmente, a recuperação de anexos em listagens pode causar o problema de consultas N+1, impactando a performance do banco de dados à medida que o volume de dados cresce.
- **Solução:** Implementar o padrão `DataLoader` para interceptar e agrupar as solicitações de anexos em uma única query por ciclo de vida da requisição.
- **Benefício:** Redução drástica de overhead no banco de dados em endpoints de listagem (REST), garantindo escalabilidade e performance "Padrão Ouro".
