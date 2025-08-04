import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import { InfrastructureBuilding, Prisma } from '@sisman/prisma';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { InfrastructureFacilityComplexWithRelationsResponseDto } from '../../infrastructure-facilities-complexes/dto/infrastructure-facility-complex.dto';
import { UpdateInfrastructureOccurrenceDto } from '../../infrastructure-occurrences/dto/infrastructure-occurrence.dto';
import { UpdateMaintenanceInstance } from '../../maintenance-instances/dto/maintenance-instance.dto';
import { UpdateMaintenanceRequestDto } from '../../maintenance-requests/dto/maintenance-request.dto';
import { UpdateUserDto } from '../../users/dto/user.dto';
import { UpdateInfrastructureBuildingActivityDto } from '../../infrastructure-buildings-activities/dto/infrastructure-building-activity.dto';
import { UpdateInfrastructureSpaceDto } from '../../infrastructure-spaces/dto/infrastructure-space.dto';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class InfrastructureBuildingBaseDto implements InfrastructureBuilding {
  /**
   * Identificador único do edifício (sub-RIP).
   * @example 'PRD-IMD-001'
   */
  @IsString()
  @IsNotEmpty()
  id: string;

  /**
   * Nome oficial do edifício.
   * @example 'Prédio do Instituto Metrópole Digital'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Coordenada de latitude do ponto central do edifício.
   * @example -5.843472
   */
  @IsLatitude()
  @IsNumber()
  @Type(() => Number)
  latitude: Prisma.Decimal;

  /**
   * Coordenada de longitude do ponto central do edifício.
   * @example -35.201633
   */
  @IsLongitude()
  @IsNumber()
  @Type(() => Number)
  longitude: Prisma.Decimal;

  /**
   * ID da instância de manutenção responsável pelo edifício.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  maintenanceInstanceId: number;

  /**
   * Apelido ou nome popular do edifício.
   * @example 'IMD'
   */
  @IsString()
  @IsOptional()
  alias: string | null;

  /**
   * Descrição detalhada do edifício e suas atividades.
   * @example 'Prédio principal do IMD, com laboratórios de pesquisa e salas de aula.'
   */
  @IsString()
  @IsOptional()
  description: string | null;

  /**
   * Zona ou setor onde o edifício está localizado.
   * @example '1'
   */
  @IsString()
  @IsNotEmpty()
  zone: string;

  /**
   * Data e hora de criação do registro.
   * Gerado automaticamente.
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   * Gerado automaticamente.
   */
  @IsDate()
  updatedAt: Date;

  /**
   * Indica se o acesso ao edifício é restrito.
   * @example false
   */
  @IsBoolean()
  restrictedAccess: boolean;

  /**
   * ID do complexo de instalações (campus) ao qual o edifício pertence.
   * @example '1761.00464.500-8'
   */
  @IsString()
  @IsNotEmpty()
  facilityComplexId: string;

  /**
   * ID do tipo de edificação.
   * @example 2
   */
  @IsNumber()
  @IsNotEmpty()
  infrastructureBuildingTypeId: number;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const InfrastructureBuildingRelationOnlyArgs =
  Prisma.validator<Prisma.InfrastructureBuildingDefaultArgs>()({
    select: {
      facilityComplex: true,
      infraOccurrences: true,
      maintenanceInstance: true,
      maintenanceRequests: true,
      managers: true,
      primaryActivity: true,
      secondariesActivities: true,
      spaces: true,
      systems: true,
      unidadesSipacVinculadas: true
    }
  });

type InfrastructureBuildingRelationsOnly =
  Prisma.InfrastructureBuildingGetPayload<
    typeof InfrastructureBuildingRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class InfrastructureBuildingWithRelationsResponseDto
  extends InfrastructureBuildingBaseDto
  implements Partial<InfrastructureBuildingRelationsOnly>
{
  /**
   * Dados do complexo de instalações (campus) ao qual o edifício pertence.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => InfrastructureFacilityComplexWithRelationsResponseDto)
  facilityComplex?: InfrastructureBuildingRelationsOnly['facilityComplex'];

  /**
   * Lista de ocorrências de infraestrutura registradas para este edifício.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureOccurrenceDto)
  infraOccurrences?: InfrastructureBuildingRelationsOnly['infraOccurrences'];

  /**
   * Dados da instância de manutenção responsável pelo edifício.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceInstance)
  maintenanceInstance?: InfrastructureBuildingRelationsOnly['maintenanceInstance'];

  /**
   * Lista de requisições de manutenção abertas para este edifício.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaintenanceRequestDto)
  maintenanceRequests?: InfrastructureBuildingRelationsOnly['maintenanceRequests'];

  /**
   * Lista de usuários (gestores) associados a este edifício.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserDto)
  managers?: InfrastructureBuildingRelationsOnly['managers'];

  /**
   * Atividade primária desenvolvida no edifício.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingActivityDto)
  primaryActivity?: InfrastructureBuildingRelationsOnly['primaryActivity'];

  /**
   * Lista de atividades secundárias desenvolvidas no edifício.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureBuildingActivityDto)
  secondariesActivities?: InfrastructureBuildingRelationsOnly['secondariesActivities'];

  /**
   * Lista de espaços (ambientes) contidos neste edifício.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureSpaceDto)
  spaces?: InfrastructureBuildingRelationsOnly['spaces'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================
/**
 * DTO para criar um novo edifício.
 */

export class CreateInfrastructureBuildingDto extends IntersectionType(
  PartialType(InfrastructureBuildingBaseDto),
  PickType(InfrastructureBuildingBaseDto, ['id', 'name'] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================
/**
 * DTO para atualizar um edifício existente.
 */
export class UpdateInfrastructureBuildingDto extends PartialType(
  CreateInfrastructureBuildingDto
) {
  /**
   * Identificador único do edifício (sub-RIP).
   * @example 'PRD-IMD-001'
   */
  @IsString()
  @IsNotEmpty()
  id: string;
}
