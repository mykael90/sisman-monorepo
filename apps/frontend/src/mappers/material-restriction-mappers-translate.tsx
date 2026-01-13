import { RestrictionOrderStatus } from '@sisman/prisma';

// Passo 1: Defina o objeto como a ÚNICA fonte da verdade.
// Use "as const" para que o TypeScript infira os tipos mais específicos possíveis
// (ex: 'Parcialmente Restrita' em vez de apenas 'string').
export const statusMaterialRestrictionDisplayMap = {
  PARTIALLY_RESTRICTED: 'Parcial',
  FULLY_RESTRICTED: 'Total',
  FREE: 'Liberada'
} as const; // <-- A mágica acontece aqui!

// Passo 2 (Opcional, mas recomendado): Verificação de consistência.
// Esta linha não faz nada em tempo de execução, mas garante em tempo de compilação
// que TODAS as chaves do enum do Prisma estão presentes no seu mapa.
// Se você adicionar um status no schema.prisma e não atualizar o mapa, o TypeScript vai acusar um erro aqui!
const _check: Record<RestrictionOrderStatus, string> =
  statusMaterialRestrictionDisplayMap;

// Passo 3: Derive os tipos a partir do objeto.
// Não há mais repetição de strings aqui!

// Deriva a união das CHAVES (ex: 'PARTIALLY_RESTRICTED' | 'FULLY_RESTRICTED' | ...)
export type StatusMaterialRestrictionKey =
  keyof typeof statusMaterialRestrictionDisplayMap;

// Deriva a união dos VALORES (ex: 'Parcialmente Restrita' | 'Totalmente Restrita' | ...)
export type StatusMaterialRestrictionDisplay =
  (typeof statusMaterialRestrictionDisplayMap)[StatusMaterialRestrictionKey];
