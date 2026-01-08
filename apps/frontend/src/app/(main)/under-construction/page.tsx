import { Construction, User, Target, CheckCircle } from 'lucide-react';

export default function UnderConstruction() {
  return (
    <main className='bg-background min-h-screen p-6'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <header className='mb-10 text-center'>
          <div className='bg-accent/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
            <Construction className='text-accent h-10 w-10' />
          </div>

          <h1 className='text-sisman-blue mb-2 text-4xl font-bold'>
            Desenvolvimento futuro
          </h1>

          <p className='text-muted-foreground text-lg'>
            Este módulo será desenvolvido em um momento futuro.
          </p>
        </header>

        {/* Content */}
        <section className='grid gap-6 md:grid-cols-2'>
          {/* Card 1 */}
          <div className='bg-card rounded-xl p-6 shadow-sm transition hover:shadow-md'>
            <div className='mb-4 flex items-center gap-3'>
              <User className='text-primary h-6 w-6' />
              <h2 className='text-foreground text-lg font-semibold'>Módulo</h2>
            </div>
            <p className='text-muted-foreground text-sm'>
              Esta página faz parte de um módulo a ser desenvolvido.
            </p>
          </div>

          {/* Card 2 */}
          {/* <div className='rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-700'>
            <div className='mb-4 flex items-center gap-3'>
              <Target className='h-6 w-6 text-green-600 dark:text-green-400' />
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                Objetivo
              </h2>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Centralizar informações e funcionalidades de forma clara,
              organizada e alinhada às necessidades do sistema.
            </p>
          </div> */}

          {/* Card 3 */}
          <div className='bg-card rounded-xl p-6 shadow-sm transition hover:shadow-md'>
            <div className='mb-4 flex items-center gap-3'>
              <CheckCircle className='text-secondary h-6 w-6' />
              <h2 className='text-foreground text-lg font-semibold'>Status</h2>
            </div>
            <p className='text-muted-foreground text-sm'>
              Modelagem do esquema definida. Próximas etapas incluem
              implementação de funcionalidades e testes no frontend.
            </p>
          </div>
        </section>

        {/* Footer hint */}
        <footer className='text-muted-foreground mt-12 text-center text-sm'>
          © {new Date().getFullYear()} • Conteúdo fora do escopo inicial
        </footer>
      </div>
    </main>
  );
}
