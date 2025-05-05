import * as winston from 'winston';
import { LoggerOptions, format } from 'winston';
import * as moment from 'moment-timezone'; // Precisa instalar: npm install moment-timezone

// Função para formatar o timestamp no fuso horário desejado
const timezonedTimestamp = format((info, opts: { tz: string }) => {
  const timezone = opts.tz || 'America/Sao_Paulo'; // Defina seu fuso horário aqui
  info.timestamp = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss.SSS Z'); // Formato desejado
  return info;
});

export const winstonConfig: LoggerOptions = {
  level: 'info', // Nível mínimo de log
  format: format.combine(
    timezonedTimestamp({ tz: 'America/Sao_Paulo' }), // Aplica o formato de timestamp com fuso
    format.ms(), // Adiciona o tempo desde o último log
    format.printf(({ level, message, timestamp, ms, context }) => {
      const contextString = context ? ` [${context}]` : '';
      return `${timestamp} ${level.toUpperCase()}${contextString}: ${message} ${ms}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize({ all: true }), // Adiciona cores ao console
        // Reutiliza o formato principal definido acima
        format.combine(
          timezonedTimestamp({ tz: 'America/Sao_Paulo' }),
          format.ms(),
          format.printf(({ level, message, timestamp, ms, context }) => {
            const contextString = context ? ` [${context}]` : '';
            // Aplica cor diferente ao contexto
            const coloredContext = context
              ? `\x1b[36m${contextString}\x1b[0m`
              : ''; // Ciano
            // Note que level já vem colorido aqui por causa do format.colorize({ all: true })
            return `${timestamp} ${level}${coloredContext}: ${message} ${ms}`;
          }),
        ),
      ),
    }),
    // Você pode adicionar outros transports aqui (ex: salvar em arquivo)
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
};
