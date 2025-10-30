import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getNowFormatted = (): string => {
  return format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};
