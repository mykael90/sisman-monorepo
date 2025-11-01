import { Row } from '@tanstack/react-table';
import {
  extractAndNormalizeStrings,
  ExtractMode,
  normalizeString
} from '@/lib/utils';

/**
 * Função de filtro global customizada para o TanStack Table v8.
 * Permite buscar em diferentes níveis da estrutura de dados da linha (row.original)
 * com base em prefixos no valor do filtro (filterValue).
 *
 * @param row A linha atual da tabela.
 * @param columnId O ID da coluna (não utilizado diretamente nesta função, mas parte da interface FilterFn).
 * @param filterValue O valor de busca inserido pelo usuário.
 *                    - Se começar com '**': A busca será realizada em *todos* os níveis (principal e aninhados).
 *                    - Se começar com '*': A busca será realizada *apenas* nas sub-linhas (níveis aninhados).
 *                    - Para qualquer outro valor: A busca será realizada *apenas* no nível principal da linha.
 * @returns `true` se a linha corresponder aos termos de busca no modo especificado, `false` caso contrário.
 */
//era pra usar a interface FilterFn, mas para simplificar eu escrevi a funcão de outra forma
export function customFilterFnGlobal<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string
): boolean {
  let currentFilterValue = filterValue;
  let extractMode: ExtractMode = 'onlyRows'; // Padrão: onlyRows

  if (currentFilterValue.startsWith('**')) {
    extractMode = 'all';
    currentFilterValue = currentFilterValue.substring(2); // Remove '**'
  } else if (currentFilterValue.startsWith('*')) {
    extractMode = 'onlySubrows';
    currentFilterValue = currentFilterValue.substring(1); // Remove '*'
  }

  const searchTerms = normalizeString(currentFilterValue)
    .toLowerCase()
    .split(' ')
    .filter(Boolean);

  if (searchTerms.length === 0) {
    return true;
  }

  // Extrai e normaliza todas as strings da linha (incluindo aninhadas dependendo do extractMode) com base no modo
  const allRowStrings = extractAndNormalizeStrings(row.original, extractMode);
  const fullRowSearchableText = allRowStrings.join(' ').toLowerCase();

  // Verifica se todos os termos de busca estão incluídos na string da linha
  const allTermsMatch = searchTerms.every((term) =>
    fullRowSearchableText.includes(term)
  );

  return allTermsMatch;
}
