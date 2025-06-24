'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import ButtonNavBar from './button-navbar';
import { Badge } from './badge';
import UserAvatar from './user-avatar';
import { usePathname } from 'next/navigation'; // Import for getting current route
import getFirstAndLastName from '../../lib/getFirstAndLastName';
import getNameFromLogin from '../../lib/getNameFromLogin';
import handleManualSignOut from '../../lib/auth/signout-ufrn';
import { useEffect, useState } from 'react';
import SignInButtonSkeleton from '../skeletons/button-signin-skeleton';

const SignInButton = () => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const userIsInSigninPage: boolean = usePathname().startsWith('/signin');

  if (!mounted) return <SignInButtonSkeleton></SignInButtonSkeleton>;
  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer'>
            <div className='flex items-center gap-2'>
              <UserAvatar
                imageUrl={session?.user?.image}
                name={
                  session?.user?.login
                    ? getNameFromLogin(session.user.login)
                    : getFirstAndLastName(session?.user?.name)
                }
              />
              <span className='hidden text-sm text-gray-600 sm:block dark:text-gray-300'>
                {session?.user?.login
                  ? getNameFromLogin(session.user.login)
                  : getFirstAndLastName(session?.user?.name)}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='mt-1 mr-5 w-80 rounded-md bg-gray-50 shadow-lg'>
            <DropdownMenuLabel>
              <div className='flex items-center gap-2'>
                <UserAvatar
                  imageUrl={session?.user?.image}
                  name={session?.user?.name}
                  size='xl'
                />
                <div className='flex flex-col gap-1'>
                  <p className='font-medium'>
                    {session.user?.name || 'User name'}
                  </p>
                  <p className=''>
                    {session?.user?.login ? (
                      <Badge variant='outline'>{session.user.login}</Badge>
                    ) : null}
                  </p>
                  <p className=''>{session.user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href='/profile'
                className='flex cursor-pointer items-center gap-2 dark:text-gray-300'
              >
                <Settings className='h-4 w-4' />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2 dark:text-gray-300'
              onSelect={() => handleManualSignOut()}
            >
              <LogOut className='h-4 w-4' />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <ButtonNavBar
          className='rounded-full border px-2 py-1 font-normal dark:border-gray-600'
          onClick={() => !userIsInSigninPage && signIn()}
        >
          Entrar
        </ButtonNavBar>
      )}
    </>
  );
};

export default SignInButton;
