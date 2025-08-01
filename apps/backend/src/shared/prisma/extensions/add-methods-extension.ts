// query-helper.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@sisman/prisma';

@Injectable()
export class AddMethodsExtension {
  //any logic

  exists = Prisma.defineExtension({
    name: 'exists-extension',
    model: {
      $allModels: {
        async exists<T>(
          this: T,
          where: Prisma.Args<T, 'findFirst'>['where']
        ): Promise<boolean> {
          const context = Prisma.getExtensionContext(this);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (context as any).findFirst({ where });
          return result !== null;
        }
      }
    }
  });
}
