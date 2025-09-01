import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
