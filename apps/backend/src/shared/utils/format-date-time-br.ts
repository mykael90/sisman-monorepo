import { isValid } from 'date-fns';
import { formatWithOptions, parseISO } from 'date-fns/fp';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

export const formatDates = (input: any) => {
  const formatWithLocale = formatWithOptions({ locale: ptBR });

  const timeZone = 'America/Sao_Paulo';

  const formatDate = (date: Date) => {
    const zonedDate = toZonedTime(date, timeZone);
    return formatWithLocale('dd/MM/yyyy HH:mm:ss', zonedDate);
  };

  if (typeof input === 'string' && isValid(parseISO(input))) {
    return formatDate(parseISO(input));
  }

  if (input instanceof Date) {
    return formatDate(input);
  }

  if (Array.isArray(input)) {
    return input.map(formatDates);
  }

  if (typeof input === 'object' && input !== null) {
    for (const key in input) {
      if (input[key] instanceof Date) {
        input[key] = formatDate(input[key]);
      } else if (
        typeof input[key] === 'string' &&
        isValid(parseISO(input[key]))
      ) {
        input[key] = formatDate(parseISO(input[key]));
      } else if (typeof input[key] === 'object' && input[key] !== null) {
        formatDates(input[key]);
      }
    }
  }

  return input;
};
