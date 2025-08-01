import { Prisma } from '@sisman/prisma';
import { formatWithOptions } from 'date-fns/fp';
import { ptBR } from 'date-fns/locale';

export function formatDateMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const result = await next(params);

    const formatDates = (obj: any) => {
      const formatWithLocale = formatWithOptions({ locale: ptBR });
      for (const key in obj) {
        if (obj[key] instanceof Date) {
          obj[key] = formatWithLocale(
            'dd/MM/yyyy HH:mm:ss',
            new Date(obj[key])
          );
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          formatDates(obj[key]);
        }
      }
    };

    if (Array.isArray(result)) {
      result.forEach((item) => formatDates(item));
    } else {
      formatDates(result);
    }

    return result;
  };
}
