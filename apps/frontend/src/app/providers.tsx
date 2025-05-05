'use client';

import { SidebarProvider } from '@/src/components/context/sidebar-provider';
import { SessionProvider } from 'next-auth/react';
import ThemeProvider from '@/src/theme/theme-provider';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
