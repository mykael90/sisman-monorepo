//Need to fix this

import { Prisma, PrismaClient } from '@sisman/prisma';

const softDelete = async function <M, A>(
  this: M,
  where: Prisma.Args<M, 'update'>['where']
): Promise<Prisma.Result<M, A, 'update'>> {
  const context = Prisma.getExtensionContext(this);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- There is no way to type a Prisma model
  const result = (context as any).update({
    where,
    data: {
      deletedAt: new Date()
    }
  });

  return result;
};

const isDeleted = async function <M>(
  this: M,
  where: Prisma.Args<M, 'findUnique'>['where']
): Promise<boolean> {
  const context = Prisma.getExtensionContext(this);
  // eslint-disable-next-line -- There is no way to type a Prisma model
  const result = await (context as any).findUnique({ where });

  return !!result.deletedAt;
};

export const prismaExtendedClient = (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    model: {
      $allModels: {
        softDelete,
        isDeleted
      }
    }
  });
