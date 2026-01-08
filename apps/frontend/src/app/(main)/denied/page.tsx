import React from 'react';
import {
  ShieldOff,
  User,
  MailCheck,
  AlertTriangle,
  Construction
} from 'lucide-react';

type SearchParams = Promise<{
  denyBy?: 'role' | 'maintenance-instance';
}>;

export default async function DeniedPage(props: {
  // No App Router, searchParams é diretamente um objeto, não uma Promise.
  // A tipagem original "Promise<>" pode ser de um contexto diferente ou versão mais antiga.
  // Para Next.js 14+ App Router, é direto.
  searchParams: SearchParams;
}) {
  const { denyBy } = await props.searchParams;
  return (
    <main className='bg-background min-h-screen p-6'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <header className='mb-10 text-center'>
          {/* Usando destructive/10 para erro ou acesso negado */}
          <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
            <ShieldOff className='text-destructive/50 h-10 w-10' />
          </div>

          <h1 className='text-sisman-blue mb-2 text-4xl font-bold'>
            Acesso Negado
          </h1>

          <p className='text-muted-foreground text-lg'>
            Você não tem permissão para visualizar ou manipular este recurso.
          </p>
        </header>

        {/* Content */}
        <section className='grid gap-6 md:grid-cols-2'>
          {/* Card 1 - Papel do Usuário */}
          {denyBy === 'role' && (
            <div className='bg-card rounded-xl p-6 shadow-sm transition hover:shadow-md'>
              <div className='mb-4 flex items-center gap-3'>
                <User className='text-primary h-6 w-6' />
                <h2 className='text-foreground text-lg font-semibold'>
                  Seu Papel
                </h2>
              </div>

              <p className='text-muted-foreground text-sm'>
                O acesso a esta página é restrito a um grupo específico de
                usuários. Verifique suas permissões ou entre em contato com um
                administrador.
              </p>
            </div>
          )}

          {/* Card 1b - Papel do Usuário */}
          {denyBy === 'maintenance-instance' && (
            <div className='bg-card rounded-xl p-6 shadow-sm transition hover:shadow-md'>
              <div className='mb-4 flex items-center gap-3'>
                <Construction className='text-primary h-6 w-6' />
                <h2 className='text-foreground text-lg font-semibold'>
                  Instância de Manutenção
                </h2>
              </div>

              <p className='text-muted-foreground text-sm'>
                O acesso a esta página é restrito a usuários associados a uma
                instância de manutenção.
              </p>
            </div>
          )}

          {/* Card 2 - Ação Requerida */}
          <div className='bg-card rounded-xl p-6 shadow-sm transition hover:shadow-md'>
            <div className='mb-4 flex items-center gap-3'>
              <MailCheck className='text-secondary h-6 w-6' />
              <h2 className='text-foreground text-lg font-semibold'>
                Próximos Passos
              </h2>
            </div>
            <p className='text-muted-foreground text-sm'>
              Se você acredita que isso é um erro, solicite acesso ao
              administrador do sistema. O recurso permanecerá inacessível até
              que a permissão seja concedida.
            </p>
          </div>
        </section>

        {/* Footer hint */}
        <footer className='text-muted-foreground mt-12 text-center text-sm'>
          © {new Date().getFullYear()} • Erro de permissão
        </footer>
      </div>
    </main>
  );
}
