import { Prisma } from '@sisman/prisma';

// O DMMF é a representação do seu schema.prisma
// Ele contém todas as informações, incluindo os enums e seus mapeamentos.
const enumsFromDmmf = Prisma.dmmf.datamodel.enums;

// Cache para evitar pesquisas repetidas no DMMF, otimizando a performance.
const enumMapsCache = new Map<string, Map<string, string>>();

/**
 * Obtém o valor mapeado de um enum do schema do Prisma.
 * Usa o DMMF para encontrar o valor de `@map("...")` correspondente.
 *
 * @param enumName O nome do enum como definido no schema.prisma (ex: "MaterialRequestStatusOptions").
 * @param enumKey O valor da chave do enum recebido do Prisma (ex: "FULLY_ATTENDED").
 * @returns O valor mapeado (string) ou a chave original se não encontrado.
 */
export function getMappedEnumValue(enumName: string, enumKey: string): string {
  // Verifica se já temos um mapa para este enum no cache
  if (!enumMapsCache.has(enumName)) {
    // Procura a definição do enum no DMMF
    const enumDef = enumsFromDmmf.find((e) => e.name === enumName);

    if (!enumDef) {
      // Se o enum não for encontrado, retorna a chave original para evitar quebras.
      console.warn(
        `[getMappedEnumValue] Enum "${enumName}" não encontrado no DMMF.`
      );
      return enumKey;
    }

    // Cria um mapa (chave -> valor mapeado) e o armazena no cache
    const valueMap = new Map<string, string>();
    for (const enumValue of enumDef.values) {
      // enumValue.name é a chave (ex: "FULLY_ATTENDED")
      // enumValue.dbName é o valor do @map (ex: "TOTALMENTE ATENDIDA") ou null se não houver @map
      valueMap.set(enumValue.name, enumValue.dbName ?? enumValue.name);
    }
    enumMapsCache.set(enumName, valueMap);
  }

  // Obtém o mapa do cache e retorna o valor mapeado
  const specificEnumMap = enumMapsCache.get(enumName)!;
  return specificEnumMap.get(enumKey) ?? enumKey; // Retorna a chave original como fallback
}
