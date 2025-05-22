// src/lib/logger.ts
import chalk from 'chalk';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

const logColors = {
  [LogLevel.DEBUG]: chalk.blue,
  [LogLevel.INFO]: chalk.green,
  [LogLevel.WARN]: chalk.yellow,
  [LogLevel.ERROR]: chalk.red
};

const logPrefixes = {
  [LogLevel.DEBUG]: '🐛',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '🚨'
};

// O tipo LogContext agora representa o contexto da instância
type LogContext = string;

class Logger {
  private context: LogContext; // Armazena o contexto da instância

  // Construtor para receber o contexto ao criar a instância
  constructor(context: LogContext) {
    this.context = context;
  }

  // Método privado de log agora é um método de instância
  private log(level: LogLevel, message: string, ...args: any[]) {
    const color = logColors[level];
    const prefix = logPrefixes[level];
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hourCycle: 'h24'
    });
    // Usa this.context para obter o contexto da instância
    console.log(
      color(`${prefix} [${timestamp}] [${level}] [${this.context}] ${message}`),
      ...args
    );
  }

  // Métodos públicos de log agora são métodos de instância
  // e não precisam mais receber o 'context' como parâmetro
  debug(message: string, ...args: any[]) {
    // this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  // Opcional: Manter um método estático para logs sem contexto específico
  // ou para criar instâncias (padrão Factory)
  // static logGlobal(level: LogLevel, message: string, ...args: any[]) {
  //   const color = logColors[level];
  //   const prefix = logPrefixes[level];
  //   const timestamp = new Date().toISOString();
  //   console.log(
  //     color(`${prefix} [${timestamp}] [${level}] ${message}`),
  //     ...args
  //   );
  // }
  // static infoGlobal = (message: string, ...args: any[]) => Logger.logGlobal(LogLevel.INFO, message, ...args);
  // // ... outros métodos globais ...

  // Ou um factory method:
  // static create(context: LogContext): Logger {
  //   return new Logger(context);
  // }
}

export default Logger;
