import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getNowFormatted = (): string => {
  return format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const gteDate = (date: string) => {
  if (!date) return undefined;
  const [year, month, day] = date.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const lteDate = (date: string) => {
  if (!date) return undefined;
  const [year, month, day] = date.split('-');
  //acrescente uma unidade no dia para pegar o último instante do dia
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
};
