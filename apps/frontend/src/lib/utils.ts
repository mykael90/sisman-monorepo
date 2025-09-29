import { type ClassValue, clsx } from 'clsx';
import { differenceInYears, parseISO } from 'date-fns';
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
  birthDate: string | null | undefined
): number | string {
  if (!birthDate) {
    return 'indefinido';
  }

  try {
    const parsedDate = parseISO(birthDate);
    const age = differenceInYears(new Date(), parsedDate);
    return age;
  } catch {
    return 'invalid date';
  }
}
