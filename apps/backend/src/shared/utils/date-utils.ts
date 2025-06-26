import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const now = new Date();
export const nowFormatted = format(now, 'dd/MM/yyyy HH:mm', { locale: ptBR });
