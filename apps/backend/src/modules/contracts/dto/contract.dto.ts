import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, Contract } from '@sisman/prisma';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO básico para atualização de fornecedor de contrato.
 * TODO: Implementar campos completos posteriormente.
 */
class UpdateContractProviderDto {
  @IsNumber()
  id: number;
}

class ContractBaseDto implements Contract {
  /**
   * ID único do contrato.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * ID do fornecedor associado ao contrato.
   * @example 1
   */
  @IsNumber()
  providerId: number;

  /**
   * Código SIPAC do contrato.
   * @example "CONTR/2023/12345"
   */
  @IsOptional()
  @IsString()
  codigoSipac: string | null;

  /**
   * Valor do contrato.
   * @example 150000.50
   */
  @IsOptional()
  @IsNumber()
  value: Prisma.Decimal | null;

  /**
   * Objeto do contrato.
   * @example "Construção de infraestrutura"
   */
  @IsOptional()
  @IsString()
  objeto: string | null;

  /**
   * Data de início do contrato.
   * @example "2023-01-01T00:00:00.000Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate: Date | null;

  /**
   * Data máxima de término do contrato.
   * @example "2024-12-31T23:59:59.000Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  maxEndDate: Date | null;

  /**
   * Data de criação do registro.
   * @example "2023-01-01T00:00:00.000Z"
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example "2023-01-02T12:30:45.000Z"
   */
  @IsDate()
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const ContractRelationOnlyArgs = Prisma.validator<Prisma.ContractDefaultArgs>()(
  {
    include: {
      providers: true
    }
  }
);

type ContractRelationsOnly = Prisma.ContractGetPayload<
  typeof ContractRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */
export class ContractWithRelationsResponseDto
  extends ContractBaseDto
  implements Partial<ContractRelationsOnly>
{
  /**
   * Fornecedor associado ao contrato.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContractProviderDto)
  providers?: ContractRelationsOnly['providers'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateContractDto extends IntersectionType(
  PartialType(ContractBaseDto),
  PickType(ContractBaseDto, ['id', 'providerId'] as const)
) {
  /**
   * ID do fornecedor associado ao contrato.
   * @example 1
   */
  @IsNumber()
  providerId: number;
}

export class CreateContractWithRelationsDto extends CreateContractDto {
  /**
   * Fornecedor associado ao contrato.
   */
  // @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContractProviderDto)
  providers: ContractRelationsOnly['providers'];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateContractDto extends PartialType(CreateContractDto) {}

export class UpdateContractWithRelationsDto extends UpdateContractDto {
  /**
   * Fornecedor associado ao contrato.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContractProviderDto)
  providers?: ContractRelationsOnly['providers'];
}
