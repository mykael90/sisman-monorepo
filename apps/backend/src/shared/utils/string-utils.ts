/**
 * Remove acentos e caracteres especiais de uma string.
 * @param str A string a ser normalizada.
 * @returns Uma nova string com os acentos e caracteres especiais removidos.
 */
export function normalizeString(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }

  let normalizedString = str
    .normalize('NFD') // Normaliza para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, ''); // Remove os diacríticos (acentos)

  // Remove caracteres especiais comuns, mantendo letras, números e espaços.
  // Adicione outros caracteres que deseja manter se necessário.
  normalizedString = normalizedString.replace(/[^\w\s.-]/gi, ''); // Mantém letras, números, espaços, pontos e hífens.
  return normalizedString;
}
