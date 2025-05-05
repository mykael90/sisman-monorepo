'use client';

import { Sun, Moon } from 'lucide-react';
import ButtonNavBar from '@/src/components/ui/button-navbar';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ButtonNavBar
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={`Alterar tema`}
    >
      <Sun className='hidden h-6 w-6 text-yellow-100/50 dark:block' />
      <Moon className='text-sisman-blue/70 h-6 w-6 dark:hidden' />
    </ButtonNavBar>
  );
}
