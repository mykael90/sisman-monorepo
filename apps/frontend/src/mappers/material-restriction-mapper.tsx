// Este arquivo define os mappers para os status de ordem de restrição de material,
// seguindo a lógica de material-request-mappers.tsx, onde a chave e o valor
// de exibição são os próprios nomes do status, sem tradução.
// A tradução dos status é tratada em material-restriction-mappers-translate.tsx.

export const materialRestrictionStatusDisplayMap = {
  PARTIALLY_RESTRICTED: 'PARTIALLY_RESTRICTED',
  FULLY_RESTRICTED: 'FULLY_RESTRICTED',
  FREE: 'FREE'
} as const;

export type MaterialRestrictionStatusKey =
  keyof typeof materialRestrictionStatusDisplayMap;
export type MaterialRestrictionStatusDisplay =
  (typeof materialRestrictionStatusDisplayMap)[MaterialRestrictionStatusKey];
