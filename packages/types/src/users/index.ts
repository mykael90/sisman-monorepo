// packages/shared-types/src/index.ts
// Estes tipos podem ser baseados nos modelos Prisma, mas ajustados para a API
export interface UserApiResponse {
    id: string;
    name: string | null;
    email: string;
    // NÃO inclui 'passwordHash', por exemplo
  }
  
  export interface PostApiResponse {
    id: string;
    title: string;
    content: string | null;
    author: UserApiResponse | null; // Pode incluir relações aninhadas conforme a API retorna
  }