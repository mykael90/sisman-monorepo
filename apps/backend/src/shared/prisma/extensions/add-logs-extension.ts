import { Prisma } from '@sisman/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddLogsExtension {
  perfomanceLog = Prisma.defineExtension({
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

        return result;
      },
    },
  });
}
