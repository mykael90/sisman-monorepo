// src/lib/auth/providers/magic-link-credentials-provider.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import type { CredentialsConfig } from 'next-auth/providers/credentials';

const SISMAN_API_URL = process.env.SISMAN_API_URL;
if (!SISMAN_API_URL) {
  throw new Error(
    'Variável de ambiente SISMAN_API_URL não definida para MagicLinkCredentialsProvider'
  );
}

/**
 * Configuração do CredentialsProvider para verificar o código do link mágico
 * com o backend NestJS.
 */
export const magicLinkCredentialsProviderConfig: CredentialsConfig = {
  id: 'magic-link-verifier', // Um ID único para este provider
  name: 'Magic Link Verifier',
  type: 'credentials',
  credentials: {
    // Estes são os campos que esperamos que `signIn` envie para este provider.
    // A página `/auth/callback/magic-link` fornecerá `email` e `code`.
    email: { label: 'Email', type: 'email' },
    code: { label: 'Code', type: 'text' }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.code) {
      console.error('[MagicLinkCredentialsProvider] Email ou código ausente.');
      return null; // Falha na autorização
    }

    const { email, code } = credentials;

    try {
      const response = await fetch(`${SISMAN_API_URL}/auth/magic-link/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Erro desconhecido do backend.' }));
        console.error(
          `[MagicLinkCredentialsProvider] Backend falhou na verificação: ${response.status} - ${errorData.message || 'Sem mensagem de erro específica.'}`
        );
        // Você pode querer lançar um erro específico que o NextAuth pode capturar e mostrar na UI
        // throw new Error(errorData.message || "Código inválido ou expirado.");
        return null; // Indica falha na autenticação
      }

      const user = await response.json(); // Backend retorna { id, email, name, ... }

      if (user && user.id) {
        console.log(
          `[MagicLinkCredentialsProvider] Usuário autenticado via backend: ${user.email}`
        );
        return user; // Retorna o objeto do usuário para o NextAuth
      } else {
        console.error(
          '[MagicLinkCredentialsProvider] Backend não retornou um usuário válido após verificação.'
        );
        return null;
      }
    } catch (error: any) {
      console.error(
        '[MagicLinkCredentialsProvider] Erro ao contatar o backend para verificação:',
        error.message
      );
      return null;
    }
  }
};

export default CredentialsProvider(magicLinkCredentialsProviderConfig);
