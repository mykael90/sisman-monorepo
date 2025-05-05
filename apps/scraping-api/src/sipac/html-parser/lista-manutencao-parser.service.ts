// lista-parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { IHtmlParser } from './ihtml-parser.interface'; // Assuming you have this interface

@Injectable()
export class ListaManutencaoParserService implements IHtmlParser {
  private readonly logger = new Logger(ListaManutencaoParserService.name);

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

    // Encontrar a tabela principal pela classe e caption (mais robusto)
    const $mainTable = $('table.listagem')
      .filter((i, table) => {
        const $caption = $(table).find('> caption.listagem');
        return (
          $caption.length > 0 &&
          $caption.text().includes('Lista de Requisições Encontradas')
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
    const headerElements = $table.find('> thead > tr > th');

    headerElements.each((i, th: cheerio.Element) => {
      const $th: cheerio.Cheerio = $(th);
      const rawHeader = this.cleanValue($th.text());

      // Ignora headers vazios ou que contenham apenas imagens/links (trataremos o ID na linha)
      if (rawHeader && rawHeader !== ' ' && $th.find('img, a').length === 0) {
        // Normalização específica se necessário (ex: 'Número/Ano')
        if (rawHeader.toLowerCase() === 'número/ano') {
          headers.push('numeroAno');
        } else {
          headers.push(this.toCamelCase(rawHeader));
        }
      } else {
        headers.push(null); // Marca como nulo para ignorar ou tratar especialmente depois
      }
    });

    const data: object[] = [];
    $table.find('> tbody > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);
      const rowData = {};
      let hasData = false;
      let headerIndex = 0; // Índice para mapear com o array de headers

      $row.find('> td').each((index, cell: cheerio.Element) => {
        const $cell = $(cell);

        // Tenta encontrar o link de visualização para extrair o ID
        const $viewLink = $cell.find('a[href*="visualizaRequisicao.do?id="]');
        if ($viewLink.length > 0) {
          const href = $viewLink.attr('href');
          if (href) {
            const match = href.match(/id=(\d+)/);
            if (match && match[1]) {
              rowData['id'] = match[1]; // Adiciona o campo 'id' extraído
              hasData = true;
            }
          }
        }

        // Mapeia a célula para o header correspondente, se houver um header válido
        if (headerIndex < headers.length) {
          const key = headers[headerIndex];
          if (key) {
            // Apenas processa se o header não for nulo (ignora colunas de icones sem texto no header)
            // Limpa o valor, considerando texto dentro de tooltips (onmouseover)
            let value = this.cleanValue($cell.html()); // Usar .html() para pegar texto antes de <br> e limpar depois
            if (!value) {
              value = this.cleanValue($cell.text()); // Fallback para .text()
            }

            // Extrair informação do tooltip se existir e for útil (ex: nome completo e ramal do usuário)
            const tooltip = $cell.attr('onmouseover');
            if (tooltip && key === 'usuario') {
              // Exemplo: Adicionar detalhes do usuário
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
          // Se não há mais headers esperados, podemos parar ou logar um aviso
          // this.logger.warn(`Célula extra encontrada na linha ${i}, índice ${index}. Headers: ${headers.length}`);
        }
      }); // Fim each cell

      // Adiciona o objeto da linha apenas se contiver algum dado útil (incluindo o ID)
      if (hasData && Object.keys(rowData).length > 0) {
        data.push(rowData);
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
