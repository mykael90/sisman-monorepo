// src/sipac/html-parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { IHtmlParser } from './ihtml-parser.interface';

@Injectable()
export class DefaultParserService implements IHtmlParser {
  private readonly logger = new Logger(DefaultParserService.name);

  // --- Helper Functions ---
  private normalizeText(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .trim();
  }

  private toCamelCase(text: string): string {
    const normalized = this.normalizeText(text);
    if (!normalized) return '';
    return (
      normalized
        .toLowerCase()
        // Replace sequences of non-alphanumeric chars, followed by a char, with the uppercase char
        .replace(/[^a-z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
        // Remove any remaining non-alphanumeric chars (e.g., leading/trailing)
        .replace(/[^a-zA-Z0-9]/g, '')
    );
  }

  // --- Main Parsing Logic ---
  parse(html: string, sourceUrl: string): any {
    const $ = cheerio.load(html);
    const resultado: Record<string, any> = {}; // Using Record for better typing

    this.logger.debug(`Starting HTML parsing for URL: ${sourceUrl}`);

    // 1. Extract Tables
    $('table').each((index, tableElement) => {
      const $table = $(tableElement);
      const dadosTabela: {
        title: string;
        headers: string[];
        rows: Record<string, string>[];
      } = {
        title: '',
        headers: [],
        rows: [],
      };

      // Extract Title
      const caption = $table.find('caption').first().text().trim();
      const titleGuess = this.normalizeText(caption) || `table${index + 1}`;
      dadosTabela.title = titleGuess;
      const tableKey = this.toCamelCase(titleGuess) || `table${index}`; // Key for the result object

      this.logger.verbose(
        `Parsing table found with potential title: "${caption}" -> Key: "${tableKey}"`,
      );

      // Extract Headers (Try thead first, then first row th)
      let headerElements = $table.find('thead th');
      if (headerElements.length === 0) {
        headerElements = $table.find('tr:first-child th');
      }

      headerElements.each((i, th) => {
        const headerText = $(th).text().trim();
        // Only add non-empty headers to avoid issues with complex layouts
        if (headerText) {
          dadosTabela.headers.push(this.toCamelCase(headerText));
        }
      });

      // If still no headers, generate default col1, col2... based on first data row
      if (dadosTabela.headers.length === 0) {
        const firstDataRowCells = $table.find(
          'tbody tr:first-child td, tr:nth-child(2) td',
        ); // Try tbody first, then second row overall
        if (firstDataRowCells.length > 0) {
          this.logger.verbose(
            `No headers found for table ${tableKey}, generating defaults (col1, col2...).`,
          );
          firstDataRowCells.each((i) => {
            dadosTabela.headers.push(`col${i + 1}`);
          });
        } else {
          this.logger.warn(
            `Could not determine headers or columns for table ${tableKey}`,
          );
        }
      }

      // Extract Rows (Try tbody first, then all rows except the first if no thead was used)
      let rowElements = $table.find('tbody tr');
      // If we used the first row for headers (no thead) and no tbody exists, skip the first row
      if (
        rowElements.length === 0 &&
        headerElements.length > 0 &&
        $table.find('thead').length === 0
      ) {
        rowElements = $table.find('tr').slice(1);
      } else if (rowElements.length === 0) {
        // If no tbody and we generated headers, grab all rows assuming no header row exists physically
        if (dadosTabela.headers.some((h) => h.startsWith('col'))) {
          rowElements = $table.find('tr');
        } else {
          // Fallback if structure is very unusual
          rowElements = $table.find('tr').slice(1); // Assume first row was header
        }
      }

      rowElements.each((rowIndex, rowElement) => {
        const $row = $(rowElement);
        const cells = $row.find('td');
        if (cells.length > 0 && cells.length >= dadosTabela.headers.length) {
          // Ensure enough cells
          const rowData: Record<string, string> = {};
          cells.each((cellIndex, cellElement) => {
            // Use header if available, otherwise default col key
            const key = dadosTabela.headers[cellIndex] || `col${cellIndex + 1}`;
            rowData[key] = $(cellElement).text().trim();
          });
          // Only add row if it has meaningful data
          if (Object.values(rowData).some((val) => val !== '')) {
            dadosTabela.rows.push(rowData);
          }
        } else if (cells.length > 0) {
          this.logger.warn(
            `Row ${rowIndex} in table ${tableKey} has ${cells.length} cells, but ${dadosTabela.headers.length} headers were expected. Skipping or data may be incomplete.`,
          );
          // Optionally try to parse anyway with default keys
        }
      });

      // Only add table if it has rows or at least identified headers
      if (dadosTabela.rows.length > 0 || dadosTabela.headers.length > 0) {
        resultado[tableKey] = {
          title: dadosTabela.title, // Keep original title for reference
          headers: dadosTabela.headers,
          rows: dadosTabela.rows,
        };
      } else {
        this.logger.warn(
          `Skipping table ${tableKey} as no rows or headers could be extracted.`,
        );
      }
    });

    // 2. Extract Forms
    $('form').each((index, formElement) => {
      const $form = $(formElement);
      const formId = $form.attr('id');
      const formName = $form.attr('name');
      const formAction = $form.attr('action');
      const formKey = this.toCamelCase(
        formName || formId || `form${index + 1}`,
      );
      const formData: Record<string, string | string[]> = {
        // Allow string arrays for multi-select/checkboxes
        action: formAction || '',
        method: ($form.attr('method') || 'GET').toUpperCase(),
      };

      this.logger.verbose(
        `Parsing form found with name/id: "${formName || formId}" -> Key: "${formKey}"`,
      );

      $form.find('input, select, textarea').each((inputIndex, inputElement) => {
        const $input = $(inputElement);
        const type = (
          $input.attr('type') || $input.prop('tagName')
        ).toLowerCase();
        const name = $input.attr('name');
        const id = $input.attr('id');
        const value = $input.val() as string | string[]; // Cheerio val() can return string[] for select multiple

        if (!name) {
          this.logger.debug(
            `Skipping input in form ${formKey} without a 'name' attribute (id: ${id})`,
          );
          return; // Skip inputs without a name, crucial for submission
        }

        const inputKey = this.toCamelCase(name);

        // Handle different input types
        if (type === 'checkbox' || type === 'radio') {
          if ($input.is(':checked')) {
            // For multiple checkboxes with same name, store as array
            if (formData[inputKey] && Array.isArray(formData[inputKey])) {
              (formData[inputKey] as string[]).push(value as string);
            } else if (formData[inputKey]) {
              // If it exists but wasn't array, make it one
              formData[inputKey] = [
                formData[inputKey] as string,
                value as string,
              ];
            } else {
              formData[inputKey] = value;
            }
          }
        } else if (type === 'select') {
          // .val() handles single and multiple selects correctly
          formData[inputKey] = value;
        } else if (type === 'textarea') {
          formData[inputKey] = $input.text(); // Use text() for textarea content
        } else {
          // Standard input types (text, hidden, password, etc.)
          formData[inputKey] = value;
        }
      });

      if (Object.keys(formData).length > 2) {
        // More than just action/method
        resultado[formKey] = formData;
      } else {
        this.logger.verbose(
          `Skipping form ${formKey} as no input fields with names were found.`,
        );
      }
    });

    // 3. Extract Informative Divs (Example - adjust selectors as needed)
    // This part is highly dependent on the specific HTML structure of SIPAC pages
    $(
      'div.info, div.dados, div.bloco, #conteudo div:not(:has(table)):not(:has(form))',
    ).each((index, divElement) => {
      const $div = $(divElement);
      const divId = $div.attr('id');
      const divClasses = ($div.attr('class') || '').split(' ').filter((c) => c); // Get array of classes
      let divKey = `infoDiv${index + 1}`; // Default key

      // Try to create a more meaningful key from ID or classes
      if (divId) {
        divKey = this.toCamelCase(divId);
      } else if (divClasses.length > 0) {
        divKey = this.toCamelCase(divClasses.join(' ')); // CamelCase combined classes
      }

      // Avoid re-processing divs containing tables or forms we already handled
      if ($div.find('table').length > 0 || $div.find('form').length > 0) {
        this.logger.debug(
          `Skipping div ${divKey} because it contains a table or form.`,
        );
        return;
      }

      const divData: Record<string, string> = {};
      let textContent = '';

      // Attempt 1: Look for key: value patterns (e.g., <strong>Label:</strong> Value)
      $div.find('strong, b, label').each((labelIndex, labelElement) => {
        const $label = $(labelElement);
        const labelText = $label.text().trim().replace(':', ''); // Clean label
        if (labelText) {
          let valueText = '';

          // FIX: Use .get(0) to access the underlying node safely, then nextSibling
          const rawLabelNode = $label.get(0); // Get the underlying DOM-like node wrapped by Cheerio
          if (rawLabelNode) {
            const nextNode = rawLabelNode.nextSibling; // Access the property on the raw node
            if (nextNode && nextNode.type === 'text') {
              // Check if it exists and is a text node
              valueText = nextNode.data.trim();
            }
          }

          // Fallback to next ELEMENT sibling's text if text node wasn't found directly
          if (!valueText && $label.next().length > 0) {
            valueText = $label.next().text().trim();
          }

          // Simple split as fallback... (rest of the logic remains the same)
          if (!valueText && $label.parent().is('p, div')) {
            const parentText = $label.parent().text().trim();
            const parts = parentText.split(':');
            if (
              parts.length > 1 &&
              this.normalizeText(parts[0]) === this.normalizeText(labelText)
            ) {
              valueText = parts.slice(1).join(':').trim();
            }
          }

          if (valueText) {
            // Ensure the key is unique... (rest of the logic remains the same)
            let potentialKey = this.toCamelCase(labelText);
            let counter = 1;
            while (divData.hasOwnProperty(potentialKey)) {
              potentialKey = `${this.toCamelCase(labelText)}${counter++}`;
            }
            divData[potentialKey] = valueText;
          }
        }
      });

      // Attempt 2: If no key-value pairs found, grab all paragraph/span text
      if (Object.keys(divData).length === 0) {
        $div.find('p, span').each((pIndex, pElement) => {
          const pText = $(pElement).text().trim();
          if (pText) {
            textContent += (textContent ? '\n' : '') + pText;
          }
        });
        // If still empty, get the direct text of the div itself, excluding children already processed
        if (!textContent) {
          textContent = $div.clone().children().remove().end().text().trim();
        }
      }

      if (Object.keys(divData).length > 0) {
        resultado[divKey] = divData;
        this.logger.verbose(`Parsed key-value data from div ${divKey}`);
      } else if (textContent) {
        resultado[divKey] = { textContent: textContent }; // Store raw text if no structure found
        this.logger.verbose(`Stored raw text content from div ${divKey}`);
      }
    });

    this.logger.debug(
      `Finished HTML parsing for ${sourceUrl}. Extracted ${Object.keys(resultado).length} top-level items.`,
    );

    // Final JSON Structure
    return {
      metadata: {
        sourceUrl: sourceUrl,
        dateExtraction: new Date().toISOString(),
        parser: 'DefaultParserService',
      },
      extractedData: resultado,
    };
  }

  // Specific formatter (Example based on your request)
  formatRequisitionData(parsedData: any): any {
    const output = {
      requisition: {},
      items: [],
      history: [], // Renamed for consistency
      operations: [],
    };

    const data = parsedData.extractedData || {};

    for (const [key, section] of Object.entries(data)) {
      if (
        section &&
        typeof section === 'object' &&
        'rows' in section &&
        Array.isArray(section.rows)
      ) {
        const rows = section.rows as Record<string, string>[];
        // Use includes for flexibility in naming conventions
        if (
          key.toLowerCase().includes('dadosdarequisicao') ||
          key.toLowerCase().includes('requisicao')
        ) {
          // Often requisition data is key-value, might be in a table or divs
          if (rows.length > 0) {
            // Assuming first row contains the main data if structured as a table row
            // Or if it's key-value pairs listed row-by-row (like col1=key, col2=value)
            rows.forEach((row) => {
              // Check if it looks like a key-value pair row
              if (row.col1 && row.col2 && !row.col3) {
                output.requisition[this.toCamelCase(row.col1)] = row.col2;
              } else {
                // Assume it's a single record row
                Object.entries(row).forEach(([field, value]) => {
                  output.requisition[this.toCamelCase(field)] = value;
                });
              }
            });
          } else if (data[key] && !Array.isArray(data[key])) {
            // Maybe extracted from divs?
            Object.assign(output.requisition, data[key]);
          }
        } else if (
          key.toLowerCase().includes('itensdarequisicao') ||
          key.toLowerCase().includes('itens')
        ) {
          output.items = rows.map((row) => this.camelCaseKeys(row));
        } else if (
          key.toLowerCase().includes('historico') ||
          key.toLowerCase().includes('movimentacoes')
        ) {
          output.history = rows.map((row) => this.camelCaseKeys(row));
        } else if (
          key.toLowerCase().includes('operacoes') ||
          key.toLowerCase().includes('orcamentarias')
        ) {
          output.operations = rows.map((row) => this.camelCaseKeys(row));
        }
      } else if (
        key.toLowerCase().includes('dadosdarequisicao') ||
        key.toLowerCase().includes('requisicao')
      ) {
        // Handle case where requisition data might be from parsed divs/forms, not tables
        if (section && typeof section === 'object' && !Array.isArray(section)) {
          Object.assign(
            output.requisition,
            this.camelCaseKeys(section as Record<string, string>),
          );
        }
      }
    }

    return output;
  }

  private camelCaseKeys(obj: Record<string, string>): Record<string, string> {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[this.toCamelCase(key)] = value;
    }
    return newObj;
  }
}
