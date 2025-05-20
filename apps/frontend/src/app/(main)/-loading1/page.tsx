import { Loader2 } from 'lucide-react';

function page() {
  return (
    <div className='bg-background flex min-h-screen flex-col items-center justify-center'>
      <div className='flex flex-col items-center space-y-4'>
        <Loader2 className='text-primary h-16 w-16 animate-spin' />
        <p className='text-muted-foreground text-lg'>Carregando...</p>
      </div>
      {/* 
        Opcional: Adicionar um toque de branding ou um texto mais elaborado
        <div className="absolute bottom-8 text-sm text-muted-foreground">
          Seu Projeto Incrível
        </div> 
      */}
    </div>
  );
}

export default page;
