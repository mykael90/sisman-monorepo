/**
 * Remove acentos e caracteres especiais e espaços duplicados de uma string.
 * @param str A string a ser normalizada.
 * @returns Uma nova string com os acentos e caracteres especiais removidos.
 */
export function normalizeString(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }

  let normalizedString = str
    .normalize('NFD') // Normaliza para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos (acentos)
    .replace(/[^\w\s.-]/gi, '') // Remove caracteres especiais e mantém letras, números, espaços, pontos e hífens.
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ') // Substitui espaços invisíveis por espaço comum
    .replace(/\s{2,}/g, ' '); // Remove espaços duplicados
  // Substitui dois ou mais espaços consecutivos por apenas um

  return normalizedString;
}
