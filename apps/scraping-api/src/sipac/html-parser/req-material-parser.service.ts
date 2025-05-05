import { Injectable, Logger } from '@nestjs/common';
// Importar tipos específicos do Cheerio
import * as cheerio from 'cheerio';
import { IHtmlParser } from './ihtml-parser.interface'; // Importe a interface

@Injectable()
export class ReqMaterialParserService implements IHtmlParser {
  private readonly logger = new Logger(ReqMaterialParserService.name);

  /**
   * Função principal para parsear o HTML da página de requisição de material para JSON.
   * @param html A string contendo o conteúdo HTML da página.
   * @param sourceUrl A URL de origem do HTML (para metadados).
   * @returns {object} Objeto JSON contendo metadados e os dados extraídos.
   */
  parse(html: string, sourceUrl: string): object {
    // Explicitamente tipar $ como CheerioAPI
    const $: cheerio.Root = cheerio.load(html);

    const result = {
      metadata: {
        url: sourceUrl || 'N/A',
        dateExtraction: new Date().toISOString(),
        parser: 'ReqMaterialParserService',
      },
      data: {},
    };

    const allTables: cheerio.Cheerio = $('table'); // Seleção é Cheerio<Element>

    allTables.each((index, tableElement: cheerio.Element) => {
      // element é do tipo Element
      // $table é uma seleção Cheerio<Element>
      const $table: cheerio.Cheerio = $(tableElement);

      if ($table.closest('td, th').length > 0) {
        return;
      }

      const $captionElement: cheerio.Cheerio = $table.find('> caption').first();
      let dataKey = '';

      if ($captionElement.length > 0) {
        const rawCaption = this.cleanValue($captionElement.text());
        dataKey = this.toCamelCase(rawCaption);
      } else {
        return;
      }

      if (!dataKey) {
        return;
      }

      const isKeyValueLikely =
        $table.is('.formulario') ||
        $table.find('tr > th.rotulo').length > 0 ||
        ($table.find('tr > th').length > 0 &&
          $table.find('tr > td').length > 0 &&
          $table.find('> thead').length === 0);

      const hasTheadTbody =
        $table.find('> thead').length > 0 && $table.find('> tbody').length > 0;

      try {
        // Passa $table (Cheerio<Element>) e $ (CheerioAPI)
        if (dataKey === 'dadosDaRequisicao' || isKeyValueLikely) {
          const parsedData = this.parseKeyValueTable($table, $);
          if (Object.keys(parsedData).length > 0) {
            result.data[dataKey] = parsedData;
          }
        } else if (hasTheadTbody) {
          const parsedData = this.parseListTable($table, $);
          if (parsedData.length > 0) {
            result.data[dataKey] = parsedData;
          }
        } else {
          const parsedData = this.parseKeyValueTable($table, $);
          if (Object.keys(parsedData).length > 0) {
            result.data[dataKey] = parsedData;
          } else {
            // this.logger.warn(`Falha ao parsear tabela "${dataKey}" [${index}] como KeyValue.`);
          }
        }
      } catch (error) {
        this.logger.error(
          `Erro ao processar tabela "${dataKey}" [${index}]: ${error.message}`,
          error.stack,
        );
      }
    });

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
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
    const words = processedText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    return words
      .map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  private cleanValue(text: string | null): string {
    if (!text) return '';
    return text
      .replace(/[\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Processa uma tabela no estilo lista/grid (com <thead> e <tbody>).
   * @param $table A seleção Cheerio da tabela a ser processada.
   * @param $ O contexto CheerioAPI global.
   * @returns Um array de objetos.
   */
  private parseListTable(
    // Usar os tipos importados: Cheerio<Element> e CheerioAPI
    $table: cheerio.Cheerio,
    $: cheerio.Root,
  ): object[] {
    const headers: (string | null)[] = [];
    // .each fornece Element no callback
    $table.find('> thead > tr > th').each((i, th: cheerio.Element) => {
      const $th: cheerio.Cheerio = $(th); // $th é uma seleção Cheerio
      const rawHeader = this.cleanValue($th.text());

      if (rawHeader && rawHeader !== ' ' && $th.find('img').length === 0) {
        let headerText = rawHeader;
        const lowerHeader = headerText.toLowerCase();
        if (lowerHeader === 'nr') headerText = 'numeroItem';
        else if (lowerHeader === 'a') headerText = 'quantidadeAtendida';
        else if (lowerHeader === 'd') headerText = 'quantidadeDevolvida';
        else if (lowerHeader === 'c') headerText = 'quantidadeEmCompra';
        else if (lowerHeader === 'e') headerText = 'quantidadeEmpenhada';
        else if (lowerHeader === 'l') headerText = 'quantidadeEmLiquidacao';
        else if (lowerHeader === 'valor a.') headerText = 'valorAtendimento';
        else if (lowerHeader === 'total a.') headerText = 'totalAtendimento';
        else if (lowerHeader === 'unid. med.') headerText = 'unidadeMedida';

        headers.push(this.toCamelCase(headerText));
      } else {
        headers.push(null);
      }
    });

    const data: object[] = [];
    $table.find('> tbody > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);
      const rowData = {};
      let hasData = false;

      $row.find('> td').each((index, cell: cheerio.Element) => {
        if (index < headers.length && headers[index]) {
          const key = headers[index] as string;
          const value = this.cleanValue($(cell).text());
          rowData[key] = value;
          if (value) {
            hasData = true;
          }
        }
      });

      if (hasData && Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Processa uma tabela no estilo chave-valor (ex: th + td).
   * @param $table A seleção Cheerio da tabela a ser processado.
   * @param $ O contexto CheerioAPI global.
   * @returns Um objeto com chaves camelCase e valores limpos.
   */
  private parseKeyValueTable(
    // Usar os tipos importados: Cheerio<Element> e CheerioAPI
    $table: cheerio.Cheerio,
    $: cheerio.Root,
  ): object {
    const data = {};
    $table.find('> tbody > tr, > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);

      const $thElement: cheerio.Cheerio = $row
        .find('> th.rotulo, > th:first-child')
        .first();
      const $tdElement: cheerio.Cheerio = $row.find('> td').first();

      if ($thElement.length > 0 && $tdElement.length > 0) {
        const rawKey = this.cleanValue($thElement.text())
          .replace(/:$/, '')
          .trim();
        const key = this.toCamelCase(rawKey);
        const $nestedTable: cheerio.Cheerio = $tdElement
          .find('> table')
          .first();

        if ($nestedTable.length > 0) {
          const $nestedCaptionElement: cheerio.Cheerio = $nestedTable
            .find('> caption')
            .first();
          let nestedKey =
            this.toCamelCase($nestedTable.attr('id')) || key + 'Detalhes';

          if ($nestedCaptionElement.length > 0) {
            const captionText = this.cleanValue($nestedCaptionElement.text());
            if (captionText.toLowerCase().includes('itens da requisição')) {
              nestedKey = 'itensDaRequisicao';
            } else {
              nestedKey = this.toCamelCase(captionText);
            }
          }

          const nestedData = this.parseListTable($nestedTable, $);
          if (nestedData.length > 0 && nestedKey) {
            data[nestedKey] = nestedData;
          }
        } else {
          const value = this.cleanValue($tdElement.text());
          if (key) {
            data[key] = value;
          }
        }
      } else {
        const $tdWithTable: cheerio.Cheerio = $row
          .find('> td[colspan]')
          .first();
        if ($tdWithTable.length > 0) {
          const $nestedTableInColspan: cheerio.Cheerio = $tdWithTable
            .find('> table')
            .first();
          if ($nestedTableInColspan.length > 0) {
            const $nestedCaptionElement: cheerio.Cheerio = $nestedTableInColspan
              .find('> caption')
              .first();
            let nestedKey = 'detalhesAninhados';

            if ($nestedCaptionElement.length > 0) {
              const captionText = this.cleanValue($nestedCaptionElement.text());
              if (captionText.toLowerCase().includes('itens da requisição')) {
                nestedKey = 'itensDaRequisicao';
              } else {
                nestedKey = this.toCamelCase(captionText);
              }
            }

            if (nestedKey) {
              const nestedData = this.parseListTable($nestedTableInColspan, $);
              if (nestedData.length > 0) {
                data[nestedKey] = nestedData;
              }
            }
          }
        }
      }
    });
    return data;
  }
}
