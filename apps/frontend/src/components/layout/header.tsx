// /home/mykael/ts-sisman/sisman-ui/src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarContext } from '@/src/components/context/sidebar-provider';
import Image from 'next/image';
import logo from '@/assets/img/logo.svg';
import logo_dark from '@/assets/img/logo-dark.svg';
// Importe o useState e o ícone X (fechar)
import { Suspense, useState } from 'react';
import { Menu, Search, Bell, X } from 'lucide-react'; // Adicione X
import ThemeToggle from '../../theme/theme-toogle';
import ButtonNavBar from '../ui/button-navbar';
import SiginButton from '../ui/button-signin';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { toggleCollapse } = useSidebarContext();
  // Estado para controlar a visibilidade da busca em telas pequenas
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    // Adicione 'relative' para o posicionamento absoluto do input expandido
    <nav className='relative z-30 w-full bg-gray-50 py-1 shadow-md dark:bg-gray-800 dark:text-gray-300'>
      <div className='flex items-center justify-between px-2 sm:px-4'>
        {' '}
        {/* Ajuste padding */}
        {/* Lado Esquerdo: Menu + Logo */}
        {/* Esconde o lado esquerdo se a busca estiver expandida em telas pequenas */}
        <div
          className={`flex items-center ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}
        >
          <ButtonNavBar onClick={toggleCollapse} title='Menu'>
            <Menu className='h-7 w-6' />
          </ButtonNavBar>
          <Link href='/' className='flex items-center pl-2'>
            <Image
              src={logo}
              alt='SisMan Logo'
              height={25}
              className='dark:hidden'
              priority // Add priority for LCP optimization
            />
            <Image
              src={logo_dark}
              alt='SisMan Logo'
              height={25}
              className='hidden dark:block'
              priority // Add priority for LCP optimization
            />
          </Link>
          {process.env.NODE_ENV === 'development' && (
            <Badge variant={'warning'} className='ml-2'>
              Desenvolvimento
            </Badge>
          )}
        </div>
        {/* Lado Direito: Busca, Notificações, Tema, Login */}
        <div className='flex flex-grow items-center justify-end gap-2 sm:gap-3'>
          {/* --- Área de Busca --- */}
          <div className='flex items-center'>
            {/* Botão de busca para telas pequenas (< sm) */}
            {/* Mostra este botão apenas se a busca NÃO estiver expandida */}
            {!isSearchExpanded && (
              <ButtonNavBar
                onClick={() => setIsSearchExpanded(true)}
                className='rounded p-2 hover:bg-gray-200 sm:hidden dark:hover:bg-gray-700'
                aria-label='Abrir busca'
              >
                <Search className='text-sisman-blue/70 h-6 w-6 dark:text-gray-200' />
              </ButtonNavBar>
            )}

            {/* Input de busca para telas grandes (sm:) */}
            <div className='relative hidden sm:block sm:w-64 md:w-96'>
              {' '}
              {/* Ajuste responsivo da largura */}
              <Search className='pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Buscar solicitações...' // Placeholder mais curto
                className='w-full border-gray-200 bg-gray-100 pl-8 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300' // Ajuste bg, padding, text size
              />
            </div>
          </div>

          {/* Input de busca expandido para telas pequenas (< sm) */}
          {/* Mostra este div apenas se a busca ESTIVER expandida */}
          {isSearchExpanded && (
            <div className='absolute top-0 right-0 left-0 z-40 flex h-13 items-center bg-gray-50 p-1 sm:hidden dark:bg-gray-800'>
              {/* Ícone dentro do input expandido */}
              <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Buscar...'
                className='h-full flex-grow border-gray-300 bg-white pr-8 pl-8 text-sm dark:border-gray-600 dark:bg-gray-700' // Ajuste padding, bg, text size
                autoFocus // Foca automaticamente no input ao abrir
                // Opcional: Fechar ao perder o foco (pode precisar de ajustes se o botão de fechar for clicado)
                // onBlur={() => setIsSearchExpanded(false)}
              />
              {/* Botão para fechar a busca expandida */}
              <button
                onClick={() => setIsSearchExpanded(false)}
                className='absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                aria-label='Fechar busca'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
          )}

          {/* Outros Ícones/Botões (Notificações, Tema, Login) */}
          {/* Esconde estes itens se a busca estiver expandida em telas pequenas */}
          <div
            className={`flex items-center gap-1 sm:gap-2 ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}
          >
            <ButtonNavBar title='Notificações'>
              <Bell className='text-sisman-blue/70 h-6 w-6 dark:text-gray-200' />
            </ButtonNavBar>
            <ThemeToggle />
            <Suspense fallback={<div className='text-center'>Loading...</div>}>
              <SiginButton />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
