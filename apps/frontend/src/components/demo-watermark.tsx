import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assumindo que você usa o utilitário cn do shadcn/ui, senão pode remover e usar template strings

interface DemoWatermarkProps {
  label?: string;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function DemoWatermark({
  label = 'Dados Ilustrativos',
  className,
  position = 'top-right'
}: DemoWatermarkProps) {
  // Define a posição baseada na prop
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div
      className={cn(
        // Posicionamento e Layout
        'absolute z-50 flex items-center gap-2 rounded-md border px-3 py-1.5',
        // Estilo Visual (Amarelo/Amber para alerta suave)
        'border-sisman-green bg-sisman-green/20 text-white backdrop-blur-sm',
        // Tipografia
        'text-xs font-semibold tracking-wider uppercase shadow-sm',
        // UX: Permite clicar através do componente
        'pointer-events-none select-none',
        positionClasses[position],
        className
      )}
    >
      <AlertTriangle className='h-3.5 w-3.5 text-amber-200' />
      <span>{label}</span>
    </div>
  );
}
