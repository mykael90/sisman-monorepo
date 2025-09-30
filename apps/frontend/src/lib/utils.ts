import { type ClassValue, clsx } from 'clsx';
import { differenceInYears, parseISO, parse, isValid, format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function formatToBRL(
  value: number | string,
  withCurrencySymbol: boolean = false
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  const formatted = numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });

  return withCurrencySymbol ? formatted : formatted.replace(/^R\$\s?/, '');
}
// This comment is added to trigger a file re-evaluation.

export function formatAndMaskCPF(cpf: string | null | undefined): string {
  if (!cpf) {
    return 'indefinido';
  }

  // Remove qualquer caractere não numérico
  const cleaned = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    throw new Error('CPF deve conter exatamente 11 dígitos numéricos.');
  }

  // Extrai os blocks
  const block1 = cleaned.slice(0, 3);
  const block2 = '***';
  const block3 = '***';
  const block4 = cleaned.slice(9, 11);

  // Monta o CPF formatado com máscara

  return `${block1}.${block2}.${block3}-${block4}`;
}

export function calculateAge(
  birthdate: string | null | undefined
): number | string {
  if (!birthdate) {
    return 'indefinido';
  }

  try {
    const parsedDate = parseISO(birthdate);
    const age = differenceInYears(new Date(), parsedDate);
    return age;
  } catch {
    return 'invalid date';
  }
}

/**
 * Converte uma data no formato dd/MM/yyyy para yyyy-MM-dd.
 * Retorna string vazia se a data for inválida ou não for string.
 *
 * @param value - Valor desconhecido vindo do Zod
 * @returns Data normalizada no formato yyyy-MM-dd ou string vazia
 */
export const normalizeDate = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
  return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : '';
};

/**
 * Aplica máscara ao valor de entrada para o formato dd/MM/yyyy.
 * Remove caracteres não numéricos e limita a 8 dígitos.
 *
 * @param value - string digitada pelo usuário
 * @returns string mascarada no formato dd/MM/yyyy
 */
export const maskDateInput = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  const day = digitsOnly.slice(0, 2);
  const month = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4, 8);

  let maskedValue = day;
  if (month) maskedValue += `/${month}`;
  if (year) maskedValue += `/${year}`;

  return maskedValue;
};

/**
 * Converte uma string de data ISO 8601 com fuso horário (ex: "2000-01-09T22:00:00.000-02:00")
 * para o formato de data brasileiro (dd/MM/yyyy) em UTC.
 *
 * @param isoDateString A string de data no formato ISO 8601 da API, que pode ser null ou undefined.
 * @returns A data formatada como "dd/MM/yyyy" ou a string "indefinido" se o valor for nulo/vazio.
 */
export function formatOnlyDateToUTC(
  isoDateString: string | null | undefined
): string {
  // 1. Tratamento de Nulos/Vazios:
  if (!isoDateString) {
    return 'indefinido';
  }

  // 2. parseISO: Converte a string (incluindo o fuso horário) para um objeto Date.
  const dateMoment = parseISO(isoDateString);

  // *Verificação Adicional (Opcional):*
  // Para capturar strings inválidas que não são nulas (e parseISO retornaria 'Invalid Date').
  if (isNaN(dateMoment.getTime())) {
    console.error(
      `formatOnlyDateToUTC: String de data inválida fornecida: ${isoDateString}`
    );
    return 'indefinido';
  }

  // 3. formatInTimeZone: Garante que a data seja formatada no fuso horário 'UTC'.
  const formattedDate = formatInTimeZone(
    dateMoment,
    'UTC', // Fuso horário de destino
    'dd/MM/yyyy' // Formato de saída desejado
  );

  return formattedDate;
}
