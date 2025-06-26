import { MaterialRequestStatusOptions } from '@sisman/prisma';

// Passo 1: Defina o objeto como a ÚNICA fonte da verdade.
// Use "as const" para que o TypeScript infira os tipos mais específicos possíveis
// (ex: 'Cadastrada' em vez de apenas 'string').
export const statusMaterialRequestDisplayMap = {
  SIPAC_HANDLING: 'Gerenciada pelo SIPAC',
  REGISTERED: 'Cadastrada',
  PENDING: 'Pendente de Autorização',
  CHANGE_SPONSOR: 'Alterada Unidade de Custo',
  APPROVED: 'Autorizada',
  FORWARDED: 'Encaminhada',
  PARTIALLY_ATTENDED: 'Parcialmente Atendida',
  FULLY_ATTENDED: 'Totalmente Atendida',
  REJECTED: 'Rejeitada',
  CANCELLED: 'Cancelada',
  REVERSED: 'Estornada',
  MATERIAL_SENT: 'Materiais Despachados',
  MATERIAL_RECEIVED: 'Materiais Recebidos'
} as const; // <-- A mágica acontece aqui!

// Passo 2 (Opcional, mas recomendado): Verificação de consistência.
// Esta linha não faz nada em tempo de execução, mas garante em tempo de compilação
// que TODAS as chaves do enum do Prisma estão presentes no seu mapa.
// Se você adicionar um status no schema.prisma e não atualizar o mapa, o TypeScript vai acusar um erro aqui!
const _check: Record<MaterialRequestStatusOptions, string> =
  statusMaterialRequestDisplayMap;

// Passo 3: Derive os tipos a partir do objeto.
// Não há mais repetição de strings aqui!

// Deriva a união das CHAVES (ex: 'REGISTERED' | 'PENDING' | ...)
export type StatusMaterialRequestKey =
  keyof typeof statusMaterialRequestDisplayMap;

// Deriva a união dos VALORES (ex: 'Cadastrada' | 'Pendente de Autorização' | ...)
export type StatusMaterialRequestDisplay =
  (typeof statusMaterialRequestDisplayMap)[StatusMaterialRequestKey];
