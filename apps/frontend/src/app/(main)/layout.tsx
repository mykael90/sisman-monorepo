import type { Metadata } from 'next';
import Header from '@/src/components/layout/header';
import Sidebar from '@/src/components/layout/sidebar/sidebar';
import Footer from '@/src/components/layout/footer';
import Main from '@/src/components/layout/main';
import { getServerSession } from 'next-auth';
import { getSurveys } from './survey/survey-actions';
import { authOptions } from '../api/auth/_options';
import Logger from '../../lib/logger';

export const metadata: Metadata = {
  title: 'SISMAN-Infra',
  description: 'Sistema de Manutenção de Infraestrutura'
};

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const logger = new Logger(`RootLayout`);
  const session = await getServerSession(authOptions);
  const userId = session?.user.idSisman;

  const [surveys] = await Promise.all([getSurveys('showModal=true')]);

  // Pegar a primeira da lista que tem showModal (fazer logica para ter apenas uma por vez depois)
  const surveyModal = surveys?.find((survey) => survey.showModal === true);

  const shouldDisplay =
    surveyModal?.id &&
    !surveyModal?.responses.find((response) => response.userId === userId);

  const surveyToDisplay = shouldDisplay ? surveyModal : null;

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='bg-sisman-blue dark:bg-sisman-green z-50 h-2 w-full'></div>
      <Header session={session} surveyToDisplay={surveyToDisplay} />
      <div className='flex flex-1 flex-col'>
        <div className='flex h-full w-full flex-1 flex-row'>
          <Sidebar />
          <Main>
            {children}
            {modal}
          </Main>
        </div>
        <Footer /> {/* Footer will stick to the bottom */}
      </div>
    </div>
  );
}
