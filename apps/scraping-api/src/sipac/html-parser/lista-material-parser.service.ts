// lista-parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { IHtmlParser } from './ihtml-parser.interface'; // Assuming you have this interface

@Injectable()
export class ListaMaterialParserService implements IHtmlParser {
  private readonly logger = new Logger(ListaMaterialParserService.name);

  /**
   * Função principal para parsear o HTML de uma página de listagem para JSON.
   * Extrai itens da tabela principal e informações de paginação.
   * @param html A string contendo o conteúdo HTML da página.
   * @param sourceUrl A URL de origem do HTML (para metadados).
   * @returns {object} Objeto JSON contendo metadados, itens da lista e paginação.
   */
  parse(html: string, sourceUrl: string): object {
    const $: cheerio.Root = cheerio.load(html);

    const result = {
      metadata: {
        url: sourceUrl || 'N/A',
        dateExtraction: new Date().toISOString(),
        parser: 'ListaParserService',
      },
      data: {
        items: [],
        pagination: null,
      },
    };

    // Encontrar a tabela principal pela classe e caption
    const $mainTable = $('table.listagem')
      .filter((i, table) => {
        const $caption = $(table).find('> caption.listagem');
        // Adaptado para a caption "Acompanhamento de Requisições"
        return (
          $caption.length > 0 &&
          $caption.text().includes('Acompanhamento de Requisições')
        );
      })
      .first();

    if ($mainTable.length > 0) {
      result.data.items = this.parseListTable($mainTable, $);
    } else {
      this.logger.warn('Tabela principal de listagem não encontrada.');
    }

    // Extrair informações de paginação
    result.data.pagination = this.parsePagination($);

    return result;
  }

  // --- Funções Auxiliares (privadas) ---

  private removeAccents(text: string): string {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private toCamelCase(text: string): string {
    if (!text) return '';
    let processedText = this.removeAccents(text);
    processedText = processedText
      .toLowerCase()
      .replace(/[^a-z0-9\s/]/g, '') // Permite números e barra (para numero/ano)
      .replace(/\s+/g, ' ')
      .trim();
    const words = processedText.split(' ').filter(Boolean);
    if (words.length === 0) return '';
    return words
      .map((word, index) => {
        if (index === 0) return word;
        if (/^[0-9/]+$/.test(words[index - 1])) return word; // Não capitaliza após número/barra
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  private cleanValue(text: string | null): string {
    if (!text) return '';
    // Substitui <br> por espaço antes de remover tags e normalizar espaços
    const textWithSpaces = text.replace(/<br\s*\/?>/gi, ' ');
    // Remove outras tags HTML que possam ter sobrado (ex: <b> em tooltips)
    const noHtml = textWithSpaces.replace(/<[^>]*>/g, '');
    return noHtml
      .replace(/[\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/ /g, ' ')
      .replace(/^R\$\s*/, '') // Remove 'R$ ' do início (para valores monetários)
      .trim();
  }

  /**
   * Processa a tabela de listagem principal.
   * @param $table A seleção Cheerio da tabela a ser processada.
   * @param $ O contexto CheerioAPI global.
   * @returns Um array de objetos representando os itens da lista.
   */
  private parseListTable($table: cheerio.Cheerio, $: cheerio.Root): object[] {
    const headers: (string | null)[] = [];
    // O header nesta tabela usa <td> com <b> dentro
    const headerCells = $table.find('> thead > tr > td');

    headerCells.each((i, td: cheerio.Element) => {
      const $td: cheerio.Cheerio = $(td);
      // Tenta pegar o texto do <b>, senão do <td>
      let rawHeader = this.cleanValue($td.find('b').first().text());
      if (!rawHeader) {
        rawHeader = this.cleanValue($td.text());
      }

      // Ignora headers vazios ou com apenas   (colunas de icones)
      if (rawHeader && rawHeader !== ' ') {
        // Normalização específica (ex: Grupo de Material)
        if (rawHeader.toLowerCase() === 'grupo de material') {
          headers.push('grupoMaterial');
        } else if (rawHeader.toLowerCase() === 'unidade requisitante') {
          headers.push('unidadeRequisitante');
        } else if (rawHeader.toLowerCase() === 'unidade de custo') {
          headers.push('unidadeCusto');
        } else if (rawHeader.toLowerCase() === 'tipo da requisicao') {
          headers.push('tipoRequisicao');
        } else {
          headers.push(this.toCamelCase(rawHeader));
        }
      } else {
        headers.push(null); // Marca como nulo para ignorar colunas de icones
      }
    });

    const data: object[] = [];
    $table.find('> tbody > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);
      const rowData = {};
      let hasData = false;
      let idFound = false; // Flag para garantir que pegamos o ID
      let headerIndex = 0; // Índice para mapear com o array de headers

      $row.find('> td').each((index, cell: cheerio.Element) => {
        const $cell = $(cell);

        // --- Extração do ID do input hidden ---
        // Procura pelo input hidden com name='id' DENTRO desta célula
        const $hiddenIdInput = $cell.find('input[type="hidden"][name="id"]');
        if ($hiddenIdInput.length > 0) {
          const idValue = $hiddenIdInput.val();
          if (idValue) {
            rowData['id'] = idValue;
            hasData = true;
            idFound = true;
            // this.logger.debug(`Found ID: ${idValue} in cell ${index}`);
            // Nota: Não avançamos o headerIndex aqui, pois o ID está 'escondido'
            // na mesma célula visual que contém o ícone/link de visualizar,
            // e essa coluna de ícone provavelmente tem um header 'null'.
          }
        }
        // --------------------------------------

        if (headerIndex < headers.length) {
          const key = headers[headerIndex];
          if (key) {
            // Apenas processa se o header não for nulo
            // Limpa o valor, considerando texto dentro de tooltips
            let value = this.cleanValue($cell.html()); // Usa .html() para pegar texto antes de <br> e limpar
            if (!value) {
              value = this.cleanValue($cell.text()); // Fallback
            }

            // Extrair informação do tooltip se existir e for útil (ex: usuário)
            const tooltip = $cell.attr('onmouseover');
            if (tooltip && key === 'usuario') {
              const tooltipMatch = tooltip.match(/ddrivetip\('([^']+)'/);
              if (tooltipMatch && tooltipMatch[1]) {
                rowData['usuarioDetalhes'] = this.cleanValue(tooltipMatch[1]);
              }
            }

            rowData[key] = value;
            if (value) {
              hasData = true;
            }
          }
          headerIndex++; // Avança para o próximo header esperado
        } else {
          // this.logger.warn(`Célula extra encontrada na linha ${i}, índice ${index}. Headers definidos: ${headers.length}`);
        }
      }); // Fim each cell

      // Adiciona o objeto da linha apenas se contiver algum dado útil (incluindo o ID)
      if (hasData && Object.keys(rowData).length > 0 && idFound) {
        data.push(rowData);
      } else if (hasData && !idFound) {
        this.logger.warn(
          `Row ${i} skipped because ID hidden input was not found, although other data existed.`,
          JSON.stringify(rowData),
        );
      }
    }); // Fim each row

    return data;
  }

  /**
   * Extrai informações de paginação da página.
   * @param $ O contexto CheerioAPI global.
   * @returns Um objeto com informações de paginação ou null.
   */
  private parsePagination($: cheerio.Root): object | null {
    const pagination = {
      currentPage: null,
      totalPages: null,
      totalItems: null,
    };
    let found = false;

    // Tenta encontrar o texto "Página X de Y" e "Total de itens"
    const paginationText = $('center:contains("Página")').text(); // Seleciona o <center> que contém o texto

    if (paginationText) {
      const pageMatch = paginationText.match(/Página\s+(\d+)\s+de\s+(\d+)/);
      const totalMatch = paginationText.match(
        /Total de itens encontrados:\s*(\d+)/,
      );

      if (pageMatch && pageMatch[1] && pageMatch[2]) {
        pagination.currentPage = parseInt(pageMatch[1], 10);
        pagination.totalPages = parseInt(pageMatch[2], 10);
        found = true;
      }

      if (totalMatch && totalMatch[1]) {
        pagination.totalItems = parseInt(totalMatch[1], 10);
        found = true;
      }
    }

    // Fallback ou verificação usando inputs (menos ideal se o texto existe)
    if (pagination.totalPages === null) {
      const $maxPageInput = $('#pageMax');
      if ($maxPageInput.length > 0) {
        pagination.totalPages = parseInt($maxPageInput.val() as string, 10);
        found = true;
      }
    }
    if (pagination.currentPage === null) {
      const $currentPageInput = $('#pagina'); // Pode não refletir a página carregada inicialmente
      // Seria mais confiável pegar do texto "Página X de Y"
    }

    return found ? pagination : null;
  }
}

// Interface de exemplo (coloque em seu próprio arquivo .interface.ts)
// export interface IHtmlParser {
//   parse(html: string, sourceUrl: string): object;
// }
