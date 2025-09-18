// Este arquivo define os mappers para os status de requisição de material,
// seguindo a lógica de material-operations-mappers.tsx, onde a chave e o valor
// de exibição são os próprios nomes do status, sem tradução.
// A tradução dos status é tratada em material-request-mappers-translate.ts.

export const materialRequestStatusDisplayMap = {
  SIPAC_HANDLING: 'SIPAC_HANDLING',
  REGISTERED: 'REGISTERED',
  PENDING: 'PENDING',
  PENDING_CHIEF: 'PENDING_CHIEF',
  CHANGE_SPONSOR: 'CHANGE_SPONSOR',
  APPROVED: 'APPROVED',
  FORWARDED: 'FORWARDED',
  PARTIALLY_ATTENDED: 'PARTIALLY_ATTENDED',
  FULLY_ATTENDED: 'FULLY_ATTENDED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  REVERSED: 'REVERSED',
  MATERIAL_SENT: 'MATERIAL_SENT',
  MATERIAL_RECEIVED: 'MATERIAL_RECEIVED',
  CHANGED: 'CHANGED',
  ITEM_RETURNED: 'ITEM_RETURNED',
  RETURNED: 'RETURNED'
} as const;

export type MaterialRequestStatusKey =
  keyof typeof materialRequestStatusDisplayMap;
export type MaterialRequestStatusDisplay =
  (typeof materialRequestStatusDisplayMap)[MaterialRequestStatusKey];
