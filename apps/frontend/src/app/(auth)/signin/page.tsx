import { getProviders, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroLogin from '@/assets/img/hero-login.jpg';
import Logo from '@/assets/img/logo.svg';
import LogoDark from '@/assets/img/logo-dark.svg';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProvidersSigninButton from '../../../components/ui/button-signin-providers';
import { User, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

const authErrorMessages = {
  Signin: 'Try signing in with a different account.',
  OAuthSignin: 'Try signing in with a different account.',
  OAuthCallback: 'Try signing in with a different account.',
  OAuthCreateAccount: 'Try signing in with a different account.',
  EmailCreateAccount: 'Try signing in with a different account.',
  Callback: 'Try signing in with a different account.',
  OAuthAccountNotLinked:
    'To confirm your identity, sign in with the same account you used originally.',
  EmailSignin: 'Check your email inbox.',
  CredentialsSignin:
    'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  SessionExpired: 'Your session has expired. Please sign in again.',
  default: 'Unable to sign in.'
};

const getAuthErrorMessage = (error: string | undefined) => {
  if (!error) return;
  return authErrorMessages[error as keyof typeof authErrorMessages]
    ? authErrorMessages[error as keyof typeof authErrorMessages]
    : authErrorMessages.default;
};

export default async function SignIn({
  searchParams
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const { callbackUrl = '/', error } = await Promise.resolve(searchParams);
  const authError = getAuthErrorMessage(error);
  const providers = await getProviders();

  return (
    <div className='relative flex min-h-screen'>
      {/* 1. Fundo para telas pequenas (md:hidden) com maior desfoque */}
      <div className='absolute inset-0 z-0 md:hidden'>
        <Image
          src={HeroLogin}
          alt='Data center background'
          fill
          // Aplicando desfoque mais forte (blur-md)
          className='object-cover blur-md'
          priority
        />
        {/* Overlay para clarear/escurecer e melhorar contraste */}
        <div className='absolute inset-0 bg-white opacity-50 dark:bg-black dark:opacity-30'></div>
      </div>

      {/* 2. Lado esquerdo - Visível apenas em telas médias e grandes (hidden md:flex) */}
      <div className='relative hidden flex-1 flex-col justify-center p-12 text-white md:flex'>
        {/* Imagem de fundo para o lado esquerdo (escura) */}
        <div className='absolute inset-0 z-0'>
          <Image
            src={HeroLogin}
            alt='Data center'
            fill
            className='bg-blue-900 object-cover brightness-50'
            priority
          />
        </div>
        {/* Conteúdo de texto sobre a imagem (lado esquerdo) */}
        <div className='relative z-10'>
          <div className='mb-8'></div>
          <h1 className='mb-6 text-4xl leading-tight font-bold'>
            Gestão Inteligente para um Futuro Resiliente
          </h1>
          <p className='max-w-150 text-lg leading-relaxed opacity-90'>
            Acesse a plataforma unificada para monitoramento, gerenciamento e
            manutenção de ativos de infraestrutura. Simplifique as operações,
            aprimore a segurança e garanta o máximo de tempo de atividade em
            toda a sua rede.
          </p>
        </div>
      </div>

      {/* 3. Lado direito - Formulário de Login */}
      {/* Mantém padding geral para espaçamento */}
      <div className='relative z-10 mt-40 flex w-full items-baseline justify-center p-8 sm:mt-60 md:w-[32rem]'>
        {/* Caixa do formulário: Aplicando estilos de "vidro fosco" SÓ em telas pequenas */}
        <div className='w-full max-w-md space-y-6 rounded-lg bg-white/80 p-8 shadow-xl backdrop-blur-lg md:rounded-none md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none dark:bg-gray-950/80 md:dark:bg-transparent'>
          <div className='text-center'>
            {/* Ajuste de cor de texto para contraste na caixa */}
            <Image
              src={Logo}
              alt='Logo'
              className='mx-auto h-12 w-auto dark:hidden'
              width={128}
              height={128}
            ></Image>
            <Image
              src={LogoDark}
              alt='Logo'
              className='mx-auto hidden h-12 w-auto dark:block'
              width={128}
              height={128}
            ></Image>
            <p className='mt-4 text-gray-700 dark:text-gray-300'>
              Por favor, se autentique para continuar
            </p>
          </div>

          <div className='space-y-4'>
            {/* Botões de Login - Estilos simplificados, o container cuida do fundo */}
            <ProvidersSigninButton callback={callbackUrl} />
            {authError && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// NOTA: Os SVGs dos ícones dos botões foram omitidos por brevidade (`<svg>...</svg>`).
// Mantenha os SVGs originais no seu código.
