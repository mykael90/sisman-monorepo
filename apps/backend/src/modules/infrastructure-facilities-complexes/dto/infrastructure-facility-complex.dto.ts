// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// =================================================================

import { OmitType, PartialType } from '@nestjs/swagger';
import { $Enums, InfrastructureFacilityComplex, Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

/**
 * Classe base.
 * @hidden
 */
class InfrastructureFacilityComplexBaseDto
  implements InfrastructureFacilityComplex
{
  /**
   * Identificador único do complexo de instalações. Geralmente um código RIP (Registro Imobiliário Patrimonial).
   * @example '1761.00464.500-8'
   */
  @IsString()
  @IsNotEmpty()
  id: string;

  /**
   * Nome do complexo de instalações.
   * @example 'Campus Universitário Central'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Endereço principal do complexo.
   * @example 'Av. Senador Salgado Filho, 3000 - Lagoa Nova, Natal - RN, 59078-970'
   */
  @IsString()
  @IsNotEmpty()
  address: string;

  /**
   * Coordenada de latitude do ponto central do complexo.
   * @example -5.843472
   */
  @IsLatitude()
  @IsNumber()
  @Type(() => Number)
  latitude: Prisma.Decimal;

  /**
   * Coordenada de longitude do ponto central do complexo.
   * @example -35.201633
   */
  @IsLongitude()
  @IsNumber()
  @Type(() => Number)
  longitude: Prisma.Decimal;

  /**
   * Tipo do complexo de instalações.
   * @example 'UNIVERSIDADE'
   */
  @IsEnum($Enums.FacilityComplexType)
  @IsNotEmpty()
  type: $Enums.FacilityComplexType;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const InfrastructureFacilityComplexRelationOnlyArgs =
  Prisma.validator<Prisma.InfrastructureFacilityComplexDefaultArgs>()({
    select: {
      buildings: true
    }
  });

type InfrastructureFacilityComplexRelationsOnly =
  Prisma.InfrastructureFacilityComplexGetPayload<
    typeof InfrastructureFacilityComplexRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class InfrastructureFacilityComplexWithRelationsResponseDto
  extends InfrastructureFacilityComplexBaseDto
  implements Partial<InfrastructureFacilityComplexRelationsOnly>
{
  /**
   * Lista de edifícios associados a este complexo de instalações.
   */
  @IsOptional()
  @IsArray()
  buildings?: InfrastructureFacilityComplexRelationsOnly['buildings'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateInfrastructureFacilityComplexDto extends OmitType(
  InfrastructureFacilityComplexBaseDto,
  ['id'] as const
) {
  /**
   * Identificador único do complexo de instalações. Geralmente um código RIP (Registro Imobiliário Patrimonial).
   * @example '1761.00464.500-8'
   */
  @IsOptional()
  @IsString()
  id?: string;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================
export class UpdateInfrastructureFacilityComplexDto extends PartialType(
  CreateInfrastructureFacilityComplexDto
) {}
