// src/sipac/html-parser/ihtml-parser.interface.ts
export interface IHtmlParser {
  /**
   * Parses the given HTML string and returns structured data.
   * @param html The HTML content to parse.
   * @param sourceUrl Optional URL where the HTML was fetched from, for context.
   * @returns Parsed data (type can be specific or 'any').
   */
  parse(html: string, sourceUrl?: string): any; // Ou um tipo mais específico que 'any'
}

// Chave de injeção para o mapa de parsers
export const PARSER_MAP_TOKEN = 'PARSER_MAP_TOKEN';
