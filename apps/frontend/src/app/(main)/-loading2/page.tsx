import { Loader2 } from 'lucide-react';

export default function Page() {
  // Você pode adicionar qualquer UI aqui, como um Skeleton.
  // Mas para um spinner simples e centralizado:
  return (
    <div
      className='bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm'
      // aria-live="polite" // Para acessibilidade, informa sobre a atualização
      // aria-busy="true"   // Indica que esta parte da UI está ocupada
    >
      <div className='bg-card flex flex-col items-center space-y-4 rounded-lg p-8 shadow-2xl'>
        <Loader2 className='text-primary h-12 w-12 animate-spin sm:h-16 sm:w-16' />
        <p className='text-md text-muted-foreground sm:text-lg'>
          Carregando conteúdo...
        </p>
      </div>
      {/* 
        Opcional: Adicionar um toque de branding ou um texto mais elaborado
        <div className="absolute bottom-8 text-sm text-white/70">
          Seu Projeto Incrível
        </div> 
      */}
    </div>
  );
}
