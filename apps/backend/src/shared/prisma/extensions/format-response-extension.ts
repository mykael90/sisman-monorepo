import { Prisma } from '@sisman/prisma';
import { Injectable } from '@nestjs/common';
import { formatDates } from 'src/shared/utils/format-date-time-br';
import { toUpperCaseRecursive } from 'src/shared/utils/format-all-uppercase';

@Injectable()
export class FormatResponseExtension {
  formatDates = Prisma.defineExtension({
    name: 'format-dates-extension',
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        const time = end - start;
        console.log(
          { model, operation, args, time, result },
          { showHidden: false, depth: null, colors: true },
        );

        return formatDates(result);
      },
    },
  });

  upperCase = Prisma.defineExtension({
    name: 'format-dates-extension',
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        const time = end - start;
        console.log(
          { model, operation, args, time, result },
          { showHidden: false, depth: null, colors: true },
        );

        return toUpperCaseRecursive(result);
      },
    },
  });
}
