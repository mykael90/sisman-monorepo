'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogOverlay
  // Opcional: para estrutura interna, se necessário
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
  // DialogFooter,
  // DialogClose, // Se você quiser um botão de fechar explícito
} from '@/components/ui/dialog'; // Certifique-se que o caminho está correto
import { useState } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // O estado `isOpen` controla a visibilidade do Dialog do Shadcn/UI.
  // Começa como true porque, se este componente Modal for renderizado, o diálogo deve estar aberto.
  const [isOpen, setIsOpen] = useState(true);

  // Esta função será chamada pelo Dialog do Shadcn/UI quando ele tentar fechar
  // (por exemplo, ao pressionar Esc ou clicar no overlay).
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Inicia a animação de fechamento do Shadcn/UI
      setIsOpen(false);

      // Após a animação de fechamento (ou um pequeno delay para permitir que ela comece),
      // navega para trás. O tempo de delay pode ser ajustado
      // para corresponder à duração da animação de saída do Shadcn/UI Dialog.
      // As animações padrão do Shadcn são rápidas, em torno de 150-200ms.
      // Se router.back() desmontar o componente imediatamente, a animação pode ser cortada.
      // Adicionar um pequeno timeout garante que a animação de saída seja visível.
      setTimeout(() => {
        router.back();
      }, 150); // Ajuste este tempo conforme necessário (duração da animação de saída)
    }
    // Não precisamos lidar com `open === true` aqui, pois ele já começa aberto
    // e só será fechado através desta função.
  };

  // Se o componente for desmontado por qualquer outro motivo (por exemplo, navegação direta),
  // o estado `isOpen` será perdido, o que é o comportamento esperado.

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOverlay />
      <DialogContent
        className='sm:max-w-lg'
        // onOpenAutoFocus={(e) => e.preventDefault()} // Descomente se quiser evitar foco automático no primeiro elemento focável
        // onInteractOutside={(e) => { // Para controle mais fino do clique fora
        //   // Por padrão, DialogOverlay já lida com isso e chama onOpenChange(false)
        //   // Você pode adicionar lógica customizada ou e.preventDefault() se necessário
        // }}
      >
        {/* 
        Você pode usar os componentes opcionais do Shadcn/UI para estruturar o conteúdo:
        <DialogHeader>
          <DialogTitle>Título do Modal</DialogTitle>
          <DialogDescription>
            Descrição adicional aqui.
          </DialogDescription>
        </DialogHeader>
        */}

        {children}

        {/* 
        <DialogFooter>
          <Button type="submit">Salvar</Button>
          <DialogClose asChild>
             <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
        */}
      </DialogContent>
    </Dialog>
  );
}
