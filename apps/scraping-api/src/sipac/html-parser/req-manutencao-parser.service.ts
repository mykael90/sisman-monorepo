// req-manutencao-parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { IHtmlParser } from './ihtml-parser.interface'; // Assuming you have this interface

@Injectable()
export class ReqManutencaoParserService implements IHtmlParser {
  private readonly logger = new Logger(ReqManutencaoParserService.name);

  /**
   * Função principal para parsear o HTML da página de requisição de manutenção para JSON.
   * @param html A string contendo o conteúdo HTML da página.
   * @param sourceUrl A URL de origem do HTML (para metadados).
   * @returns {object} Objeto JSON contendo metadados e os dados extraídos.
   */
  parse(html: string, sourceUrl: string): object {
    const $: cheerio.Root = cheerio.load(html);

    const result = {
      metadata: {
        url: sourceUrl || 'N/A',
        dateExtraction: new Date().toISOString(),
        parser: 'ReqManutencaoParserService', // Updated parser name
      },
      data: {},
    };

    const allTables: cheerio.Cheerio = $('table');

    allTables.each((index, tableElement: cheerio.Element) => {
      const $table: cheerio.Cheerio = $(tableElement);

      // Ignorar tabelas aninhadas DENTRO de outras células de tabela (evita processar sub-partes indesejadas)
      // Ajuste: A tabela "Requisições Associadas de Materiais" tem linhas que parecem aninhadas mas a tabela em si não está dentro de um TD/TH de outra *principal*.
      // No entanto, a tabela "Dados da Requisicao" contém uma tabela interna. Precisamos ter cuidado.
      // A lógica original de `closest('td, th').length > 0` pode ser muito agressiva aqui.
      // Vamos refinar: só ignorar se *não* for uma tabela com classe 'formulario' ou 'subFormulario' ou 'listagem' que esteja aninhada.
      const isDirectChildOfBodyOrMainDiv =
        $table.parent().is('body') || $table.parent().is('#conteudo'); // Heurística
      const hasRelevantClass = $table.is(
        '.formulario, .subFormulario, .listagem',
      );

      if (
        !isDirectChildOfBodyOrMainDiv &&
        $table.closest('td, th').length > 0 &&
        !hasRelevantClass
      ) {
        // this.logger.debug(`Skipping deeply nested table [${index}] without relevant class.`);
        return; // Pula tabelas profundamente aninhadas que não são as principais que queremos
      }

      const $captionElement: cheerio.Cheerio = $table.find('> caption').first();
      let dataKey = '';

      if ($captionElement.length > 0) {
        const rawCaption = this.cleanValue($captionElement.text());
        dataKey = this.toCamelCase(rawCaption);
      } else {
        // Tentar identificar por classe se não houver caption (menos confiável)
        if ($table.is('.formulario') && !result.data['dadosDaRequisicao'])
          dataKey = 'dadosDaRequisicao';
        // else if ($table.is('.listagem') && ...) // Poderia adicionar mais heurísticas se necessário
        else {
          // this.logger.warn(`Table [${index}] skipped: No caption found.`);
          return; // Pula tabelas sem caption, a menos que identifiquemos de outra forma
        }
      }

      if (!dataKey) {
        // this.logger.warn(`Table [${index}] skipped: Could not determine dataKey.`);
        return;
      }

      // --- Lógica de decisão do tipo de parse ---
      const isKeyValueLikely =
        $table.is('.formulario') || dataKey === 'dadosDaRequisicao';
      const hasTheadTbody =
        $table.find('> thead').length > 0 && $table.find('> tbody').length > 0;
      const isMaterialRequestsTable =
        dataKey === 'requisicoesAssociadasDeMateriais';

      try {
        if (isMaterialRequestsTable) {
          const parsedData = this.parseMaterialRequestsTable($table, $);
          if (parsedData.length > 0) {
            result.data[dataKey] = parsedData;
          }
        } else if (isKeyValueLikely) {
          // O parseKeyValueTable original pode lidar com a tabela dentro de um TD na tabela 'dadosDaRequisicao'
          const parsedData = this.parseKeyValueTable($table, $);
          if (Object.keys(parsedData).length > 0) {
            // Evitar sobrescrever se já foi pego pela caption
            if (!result.data[dataKey]) {
              result.data[dataKey] = parsedData;
            } else if (dataKey === 'dadosDaRequisicao') {
              // Merge if necessary, though unlikely with current structure
              result.data[dataKey] = { ...result.data[dataKey], ...parsedData };
            }
          }
        } else if (hasTheadTbody) {
          const parsedData = this.parseListTable($table, $);
          if (parsedData.length > 0) {
            result.data[dataKey] = parsedData;
          }
        } else {
          // Fallback para KeyValue se não for lista e não for a de materiais
          const parsedData = this.parseKeyValueTable($table, $);
          if (Object.keys(parsedData).length > 0) {
            if (!result.data[dataKey]) {
              result.data[dataKey] = parsedData;
            }
          } else {
            // this.logger.warn(`Falha ao parsear tabela "${dataKey}" [${index}] como KeyValue ou Lista.`);
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
      // Manter números, remover barras e hífens extras mas permitir / em números de req
      .replace(/[^a-z0-9\s/]/g, '')
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
    const words = processedText.split(' ').filter(Boolean);
    if (words.length === 0) return '';
    return words
      .map((word, index) => {
        if (index === 0) return word;
        // Não capitalizar após número/barra (ex: numeroAno)
        if (/^[0-9/]+$/.test(words[index - 1])) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  private cleanValue(text: string | null): string {
    if (!text) return '';
    return text
      .replace(/[\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/ /g, ' ') // Tratar non-breaking spaces
      .trim();
  }

  /**
   * Processa uma tabela no estilo lista/grid (com <thead> e <tbody>).
   * @param $table A seleção Cheerio da tabela a ser processada.
   * @param $ O contexto CheerioAPI global.
   * @returns Um array de objetos.
   */
  private parseListTable($table: cheerio.Cheerio, $: cheerio.Root): object[] {
    const headers: (string | null)[] = [];
    $table
      .find('> thead > tr > th, > thead > tr > td') // Incluir TD no header se houver
      .each((i, th: cheerio.Element) => {
        const $th: cheerio.Cheerio = $(th);
        const rawHeader = this.cleanValue($th.text());

        if (
          rawHeader &&
          rawHeader !== ' ' &&
          $th.find('img').length === 0 &&
          rawHeader !== ' '
        ) {
          headers.push(this.toCamelCase(rawHeader));
        } else {
          headers.push(null); // Manter posição para alinhamento das células
        }
      });

    const data: object[] = [];
    $table.find('> tbody > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);
      const rowData = {};
      let hasData = false;
      let cellIndex = 0;

      $row.find('> td').each((index, cell: cheerio.Element) => {
        while (cellIndex < headers.length && headers[cellIndex] === null) {
          cellIndex++;
        }

        if (cellIndex < headers.length) {
          const key = headers[cellIndex] as string;
          const $cell = $(cell);
          const link = $cell.find('a').first();
          let value: string;

          if (link.length > 0) {
            value = this.cleanValue(link.text());

            // --- INÍCIO DA MODIFICAÇÃO ---
            // 1. Extrai o endereço do recurso (URL) do atributo href
            const urlRelativoRecurso = link.attr('href');
            if (urlRelativoRecurso) {
              rowData['urlRelativoRecurso'] = urlRelativoRecurso.trim();
            }

            // 2. Extrai a extensão do arquivo a partir do nome
            const nomeArquivo = value;
            if (nomeArquivo) {
              const parts = nomeArquivo.split('.');
              if (parts.length > 1) {
                // Pega o último elemento após o split e converte para minúsculas
                rowData['extensaoArquivo'] =
                  parts[parts.length - 1].toLowerCase();
              } else {
                // Caso não encontre uma extensão
                rowData['extensaoArquivo'] = null;
              }
            }
            // --- FIM DA MODIFICAÇÃO ---

            // Mantém a lógica existente para extrair 'id' do onclick, se houver
            const onclickAttr = link.attr('onclick');
            if (onclickAttr) {
              const idMatch = onclickAttr.match(/id=(\d+)/);
              if (idMatch && idMatch[1]) {
                // Adiciona a nova chave 'id' ao objeto da linha
                rowData['id'] = idMatch[1];
              }
            }
            // --- FIM DA MODIFICAÇÃO ---
          } else {
            value = this.cleanValue($cell.text());
          }

          rowData[key] = value;
          if (value) {
            hasData = true;
          }
          cellIndex++;
        }
      });

      if (hasData && Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Processa uma tabela no estilo chave-valor (ex: th + td ou th.rotulo + td).
   * Mantém a lógica original, que pode lidar com tabelas aninhadas simples dentro de TDs.
   * @param $table A seleção Cheerio da tabela a ser processado.
   * @param $ O contexto CheerioAPI global.
   * @returns Um objeto com chaves camelCase e valores limpos.
   */
  private parseKeyValueTable($table: cheerio.Cheerio, $: cheerio.Root): object {
    const data = {};
    // Busca em tbody > tr ou diretamente em tr (caso não haja tbody explícito)
    $table.find('> tbody > tr, > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);

      // Tentativa 1: Padrão th.rotulo + td
      let $thElement: cheerio.Cheerio = $row.find('> th.rotulo').first();
      let $tdElement: cheerio.Cheerio = $thElement.next('td');

      // Tentativa 2: Padrão th:first-child + td (se não encontrou com .rotulo)
      if ($thElement.length === 0 || $tdElement.length === 0) {
        $thElement = $row.find('> th:first-child').first();
        $tdElement = $thElement.next('td');
        // Caso especial: <th> com colspan=2 seguido por <td>? Pouco provável aqui.
        // Garantir que estamos pegando o TD correto
        if ($tdElement.length === 0) {
          $tdElement = $row.find('> td').first(); // Fallback para o primeiro TD na linha
        }
      }

      if ($thElement.length > 0 && $tdElement.length > 0) {
        const rawKey = this.cleanValue($thElement.text())
          .replace(/:$/, '') // Remove trailing colon
          .trim();
        const key = this.toCamelCase(rawKey);

        // Verificar se o TD contém uma tabela aninhada (cenário menos comum aqui, mas mantido por segurança)
        const $nestedTable: cheerio.Cheerio = $tdElement
          .find('> table')
          .first();

        if ($nestedTable.length > 0) {
          // Tratar tabela aninhada dentro de um TD - Tentar parsear como lista
          const $nestedCaptionElement: cheerio.Cheerio = $nestedTable
            .find('> caption')
            .first();
          const nestedKey =
            this.toCamelCase($nestedCaptionElement.text()) || key + 'Detalhes'; // Usa caption ou deriva da chave pai

          // Verificar se a tabela aninhada é lista ou key-value
          const nestedHasTheadTbody =
            $nestedTable.find('> thead').length > 0 &&
            $nestedTable.find('> tbody').length > 0;
          let nestedData;
          if (nestedHasTheadTbody) {
            nestedData = this.parseListTable($nestedTable, $);
          } else {
            nestedData = this.parseKeyValueTable($nestedTable, $); // Parse aninhado como key-value se não for lista
          }

          if (
            (Array.isArray(nestedData) && nestedData.length > 0) ||
            (typeof nestedData === 'object' &&
              Object.keys(nestedData).length > 0)
          ) {
            if (key && nestedKey && key !== nestedKey) {
              // Se a chave derivada for diferente e útil, aninha
              if (!data[key]) data[key] = {}; // Garante que a chave pai exista
              data[key][nestedKey] = nestedData;
            } else if (key) {
              // Se a chave for a mesma ou não útil, substitui/adiciona na chave pai
              data[key] = nestedData;
            }
          }
        } else {
          // Valor simples no TD
          const value = this.cleanValue($tdElement.text());
          if (key) {
            data[key] = value;
          }
        }
      } else {
        // Linhas que não se encaixam no padrão TH+TD (ex: linha com um único TD com colspan contendo uma tabela)
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
            const nestedKey =
              this.toCamelCase($nestedCaptionElement.text()) ||
              'detalhesAninhados';

            if (nestedKey) {
              const nestedHasTheadTbody =
                $nestedTableInColspan.find('> thead').length > 0 &&
                $nestedTableInColspan.find('> tbody').length > 0;
              let nestedData;
              if (nestedHasTheadTbody) {
                nestedData = this.parseListTable($nestedTableInColspan, $);
              } else {
                nestedData = this.parseKeyValueTable($nestedTableInColspan, $);
              }

              if (
                (Array.isArray(nestedData) && nestedData.length > 0) ||
                (typeof nestedData === 'object' &&
                  Object.keys(nestedData).length > 0)
              ) {
                data[nestedKey] = nestedData;
              }
            }
          }
        }
      }
    });
    return data;
  }

  /**
   * Processa a tabela específica "Requisições Associadas de Materiais".
   * Esta tabela tem uma estrutura agrupada por requisição.
   * @param $table A seleção Cheerio da tabela a ser processada.
   * @param $ O contexto CheerioAPI global.
   * @returns Um array de objetos, cada um representando uma requisição de material com seus itens.
   */
  private parseMaterialRequestsTable(
    $table: cheerio.Cheerio,
    $: cheerio.Root,
  ): object[] {
    const requests = [];
    let currentRequest: any = null;
    let itemHeaders: (string | null)[] = []; // ['material', 'quantidade', 'valor', 'valorTotal']; // Default or detect

    $table.find('> tbody > tr').each((i, row: cheerio.Element) => {
      const $row: cheerio.Cheerio = $(row);
      const $cells = $row.find('> td');
      const firstCellText = this.cleanValue($cells.eq(0).text());
      const secondCellText = this.cleanValue($cells.eq(1).text());

      // Detectar linha de cabeçalho da requisição (ex: '11288/2025' na primeira célula)
      // A linha também tem um form no último TD
      const isRequestHeaderRow =
        /^\d+\/\d+$/.test(firstCellText) &&
        $row.find('form[name="reqMatForm"]').length > 0;
      // Detectar linha de cabeçalho dos itens (ex: 'Material' na segunda célula, primeira vazia)
      const isItemHeaderRow =
        firstCellText === '' && secondCellText.toLowerCase() === 'material';
      // Detectar linha de total do grupo (ex: 'Total Grupo' na segunda célula com colspan=2 na primeira)
      const isGroupTotalRow =
        $cells.length > 3 &&
        this.cleanValue($cells.eq(0).text())
          .toLowerCase()
          .startsWith('total grupo'); // Ajustado para verificar o texto na primeira célula real (após colspan)
      if (!isGroupTotalRow && $cells.length >= 2) {
        // Checagem alternativa se o colspan falhar
        const cellWithTotalText = $cells
          .filter((idx, el) => $(el).attr('colspan') === '2')
          .first();
        if (
          cellWithTotalText.length > 0 &&
          this.cleanValue(cellWithTotalText.text())
            .toLowerCase()
            .startsWith('total grupo')
        ) {
          // isGroupTotalRow = true; // Não precisa reatribuir, apenas usar na lógica
        }
      }

      // Detectar linha de total geral (ex: 'Total das Requisições')
      const isOverallTotalRow =
        $cells.length > 3 &&
        this.cleanValue($cells.eq(0).text())
          .toLowerCase()
          .startsWith('total das requisições');
      if (!isOverallTotalRow && $cells.length >= 2) {
        // Checagem alternativa se o colspan falhar
        const cellWithTotalText = $cells
          .filter((idx, el) => $(el).attr('colspan') === '2')
          .first();
        if (
          cellWithTotalText.length > 0 &&
          this.cleanValue(cellWithTotalText.text())
            .toLowerCase()
            .startsWith('total das requisições')
        ) {
          // isOverallTotalRow = true; // Não precisa reatribuir
        }
      }

      // --- Lógica de Processamento ---
      if (isRequestHeaderRow) {
        // Se tínhamos uma requisição anterior sendo processada, adiciona ao array
        if (
          currentRequest &&
          currentRequest.itens &&
          currentRequest.itens.length > 0
        ) {
          requests.push(currentRequest);
        }
        // Inicia uma nova requisição
        currentRequest = {
          requisicao: firstCellText,
          grupo: this.cleanValue($cells.eq(1).text()),
          dataCadastro: this.cleanValue($cells.eq(2).text()),
          status: this.cleanValue($cells.eq(3).text()),
          // Poderia extrair o ID da requisição do form/link se necessário
          id: $row.find('input[name="id"]').val(),
          itens: [],
        };
        itemHeaders = []; // Resetar headers dos itens para a nova requisição
      } else if (isItemHeaderRow) {
        // Captura os cabeçalhos dos itens desta seção
        itemHeaders = [];
        $cells.each((idx, cell) => {
          if (idx > 0) {
            // Ignora a primeira célula vazia
            const headerText = this.cleanValue($(cell).find('b').text());
            itemHeaders.push(this.toCamelCase(headerText));
          }
        });
        // Fallback se não encontrar <b>
        if (itemHeaders.length === 0) {
          itemHeaders = ['material', 'quantidade', 'valor', 'valorTotal'];
          this.logger.warn(
            'Could not detect item headers automatically for a request, using defaults.',
          );
        }
      } else if (isGroupTotalRow) {
        // Adiciona informações de total à requisição atual
        if (currentRequest) {
          // Os índices dependem da estrutura exata da linha de total
          // Ex: [colspan=2 text='Total Grupo...'], [td text='41,0'], [td text='R$ 105,32'], [td text='R$ 143,89']
          // O TD com o texto do total está depois do colspan=2
          const $totalCells = $row.find('td'); // Re-seleciona para garantir
          let baseIndex = 0;
          if ($totalCells.first().attr('colspan')) {
            baseIndex = 1; // Pula a célula com colspan
          }

          currentRequest.totalGrupoQuantidade = this.cleanValue(
            $totalCells.eq(baseIndex).text(),
          );
          currentRequest.totalGrupoValorCalculado = this.cleanValue(
            $totalCells.eq(baseIndex + 1).text(),
          ); // 'R$ 105,32' - pode precisar limpar R$ e converter
          currentRequest.totalGrupoValorTotal = this.cleanValue(
            $totalCells.eq(baseIndex + 2).text(),
          ); // 'R$ 143,89'
        }
      } else if (isOverallTotalRow) {
        // Fim da tabela, ignora ou armazena o total geral separadamente se necessário
        // No momento, apenas ignoramos.
      } else if (
        currentRequest &&
        !isRequestHeaderRow &&
        !isItemHeaderRow &&
        !isGroupTotalRow &&
        !isOverallTotalRow &&
        firstCellText === ''
      ) {
        // Assumir que é uma linha de item se a primeira célula for vazia e não for outro tipo de linha
        if (itemHeaders.length > 0 && $cells.length > itemHeaders.length) {
          // Verifica se há células suficientes
          const itemData = {};
          itemHeaders.forEach((headerKey, headerIndex) => {
            if (headerKey) {
              // O índice da célula é headerIndex + 1 porque a primeira célula (td) da linha do item é vazia
              itemData[headerKey] = this.cleanValue(
                $cells.eq(headerIndex + 1).text(),
              );
            }
          });

          if (Object.keys(itemData).length > 0) {
            currentRequest.itens.push(itemData);
          }
        } else if (itemHeaders.length === 0) {
          this.logger.warn(
            'Skipping item row because item headers were not detected for the current request.',
          );
        }
      }
    });

    // Adiciona a última requisição processada se ela existir e tiver itens
    if (
      currentRequest &&
      currentRequest.itens &&
      currentRequest.itens.length > 0
    ) {
      requests.push(currentRequest);
    }

    return requests;
  }
}
