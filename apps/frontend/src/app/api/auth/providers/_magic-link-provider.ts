// src/lib/auth/providers/email-magic-link-provider.ts
import EmailProvider from 'next-auth/providers/email';
import type { EmailConfig } from 'next-auth/providers/email';

/**
 * Configuração do EmailProvider para o fluxo de Link Mágico.
 *
 * Importante: Na nossa implementação atual, este provider é mais para
 * permitir que o NextAuth mostre a página "Verifique seu e-mail" se desejado.
 * A lógica real de solicitar o link mágico (chamada ao backend NestJS)
 * ocorre na página de login customizada (`/auth/signin`).
 * O backend NestJS é quem efetivamente envia o e-mail.
 *
 * Se você não quiser usar a página "Verifique seu e-mail" do NextAuth,
 * pode até remover este provider da configuração principal do NextAuth.
 */
export const emailMagicLinkProviderConfig: EmailConfig = {
  // ID e nome são necessários
  id: 'email', // Um ID único para este provider
  type: 'email',
  name: 'Email',
  // `server` e `from` não são necessários aqui, pois o envio é feito pelo backend.
  // A função `sendVerificationRequest` é obrigatória pela tipagem,
  // mas não será o principal mecanismo de envio.
  async sendVerificationRequest(params) {
    const { identifier: email, url, provider, theme } = params;
    console.log(
      `[EmailMagicLinkProvider] Solicitação de verificação para ${email}.`
    );
    console.log(
      `[EmailMagicLinkProvider] A UI de login customizada deve chamar o backend para enviar o link.`
    );
    console.log(
      `[EmailMagicLinkProvider] O link no e-mail (enviado pelo backend) deve apontar para: /auth/callback/magic-link com params email & code.`
    );
    // Para usar a página "Verifique seu e-mail" do NextAuth após a UI de login chamar o backend:
    // Se sua UI de login chamar `signIn('email-magic', { email, redirect: false })`
    // após solicitar o link ao backend, o NextAuth usará a URL fornecida abaixo
    // para a página de "verifique seu e-mail".
    // A URL de callback padrão do NextAuth para email seria usada se não especificarmos
    // explicitamente para onde o link do email deve ir.
    // No nosso caso, o link no email vai para /auth/callback/magic-link
  },
  // Opções padrão
  maxAge:
    parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE as string) || 1 * 24 * 60 * 60 // 1 day // 24 horas (tempo que o token do NextAuth EmailProvider seria válido, não nosso código)
  // options: {}, // Para configurações específicas do provider, se necessário
};

export default EmailProvider(emailMagicLinkProviderConfig);
