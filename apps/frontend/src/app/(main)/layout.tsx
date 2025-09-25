import type { Metadata } from 'next';
import Header from '@/src/components/layout/header';
import Sidebar from '@/src/components/layout/sidebar/sidebar';
import Footer from '@/src/components/layout/footer';
import Main from '@/src/components/layout/main';

export const metadata: Metadata = {
  title: 'SISMAN-Infra',
  description: 'Sistema de Manutenção de Infraestrutura'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col'>
      <div className='bg-sisman-blue dark:bg-sisman-green z-50 h-2 w-full'></div>
      <Header />
      <div className='flex flex-1 flex-col'>
        <div className='flex h-full w-full flex-1 flex-row'>
          <Sidebar />
          <Main>{children}</Main>
        </div>
        <Footer /> {/* Footer will stick to the bottom */}
      </div>
    </div>
  );
}
