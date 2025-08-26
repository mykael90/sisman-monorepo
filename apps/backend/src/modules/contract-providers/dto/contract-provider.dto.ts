import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { ContractProvider } from '@sisman/prisma';
import { IsString, IsOptional, IsDate, Length } from 'class-validator';

// =================================================================
// 1. CLASSE BASE (FONTE DA VERDADE)
// Implementa o contrato com o Prisma e contém os decoradores de validação
// =================================================================

/**
 * Classe base para ContractProvider.
 * @hidden
 */
class ContractProviderBaseDto implements ContractProvider {
  /**
   * ID único do fornecedor.
   * @example 1
   */
  id: number;

  /**
   * CNPJ do fornecedor (14 caracteres).
   * @example "12345678000199"
   */
  @IsOptional()
  @IsString()
  @Length(14, 14, { message: 'CNPJ deve ter exatamente 14 caracteres' })
  cnpj: string | null;

  /**
   * CPF do fornecedor (11 caracteres).
   * @example "12345678901"
   */
  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 caracteres' })
  cpf: string | null;

  /**
   * Razão social do fornecedor.
   * @example "Fornecedor XYZ LTDA"
   */
  @IsOptional()
  @IsString()
  razaoSocial: string | null;

  /**
   * Nome fantasia do fornecedor.
   * @example "Fornecedor XYZ"
   */
  @IsOptional()
  @IsString()
  nomeFantasia: string | null;

  /**
   * Nome do fornecedor (para pessoas físicas).
   * @example "João da Silva"
   */
  @IsOptional()
  @IsString()
  nome: string | null;

  /**
   * Data de criação do registro.
   * @example "2023-10-27T10:00:00.000Z"
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA
// =================================================================

/**
 * DTO para representar a resposta completa do fornecedor de contrato.
 */
export class ContractProviderResponseDto extends ContractProviderBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT)
// =================================================================

/**
 * DTO para criação de um novo fornecedor de contrato.
 */
export class CreateContractProviderDto extends PickType(
  ContractProviderBaseDto,
  ['id', 'cnpj', 'cpf', 'razaoSocial', 'nomeFantasia', 'nome'] as const
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT)
// =================================================================

/**
 * DTO para atualização de um fornecedor de contrato existente.
 */
export class UpdateContractProviderDto extends PartialType(
  CreateContractProviderDto
) {}
