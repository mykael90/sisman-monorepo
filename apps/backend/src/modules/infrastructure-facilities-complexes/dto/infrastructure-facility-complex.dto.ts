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
import { isString } from 'lodash';

/**
 * Classe base.
 * @hidden
 */
export class InfrastructureFacilityComplexBaseDto
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

  /**
   * CEP do complexo de instalações.
   * @example '57072970'
   */
  @IsString()
  cep: string;

  /**
   * Município do complexo de instalações.
   * @example 'NATAL'
   */
  @IsString()
  city: string;

  /**
   * Complemento do endereço do complexo de instalações.
   * @example 'NATAL'
   */
  @IsString()
  complement: string;

  /**
   * ID da Instância de manutenção associada ao complexo de instalações.
   * @example 1
   */
  @IsNumber()
  maintenanceInstanceId: number;
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
  ['type'] as const
) {}

// =================================================================
// 3.1. DTO ESPECÍFICO PARA SEED (INPUT) - Inclui 'type'
// =================================================================
export class SeedInfrastructureFacilityComplexDto extends PartialType(
  InfrastructureFacilityComplexBaseDto
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================
export class UpdateInfrastructureFacilityComplexDto extends PartialType(
  CreateInfrastructureFacilityComplexDto
) {}
