import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { $Enums, MaintenanceRequest, Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean
} from 'class-validator';
import { UpdateMaintenanceInstance } from '../../maintenance-instances/dto/maintenance-instance.dto';
import { UpdateUserDto } from '../../users/dto/user.dto';
import { UpdateInfrastructureSpaceDto } from '../../infrastructure-spaces/dto/infrastructure-space.dto';
import { UpdateInfrastructureBuildingDto } from '../../infrastructure-buildings/dto/infrastructure-building.dto';
import { UpdateInfrastructureSystemDto } from '../../infrastructure-systems/dto/infrastructure-system.dto';
import { UpdateMaintenanceServiceTypeDto } from '../../maintenance-service-types/dto/maintenance-service-type.dto';
import { UpdateMaintenanceRequestStatusDto } from '../../maintenance-request-statuses/dto/maintenance-request-status.dto';
import { UpdateInfrastructureOccurrenceDiagnosisDto } from '../../infrastructure-occurrence-diagnosis/dto/infrastructure-occurrence-diagnosis.dto';
import { CreateMaintenanceTimelineEventDto } from '../../maintenance-timeline-events/dto/maintenance-timeline-event.dto';
import {
  CreateMaterialRequestWithRelationsDto,
  UpdateMaterialRequestWithRelationsDto
} from '../../material-requests/dto/material-request.dto';
import { UpdateInfrastructureFacilityComplexDto } from '../../infrastructure-facilities-complexes/dto/infrastructure-facility-complex.dto';
import { UpdateSipacUnidadeDto } from '../../sipac/unidades/dto/sipac-unidade.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaintenanceRequestBaseDto implements MaintenanceRequest {
  /**
   * ID da requisição de manutenção.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Número do protocolo da requisição.
   * @example "MANUT-2023-0001"
   */
  @IsString()
  protocolNumber: string;

  /**
   * Título da requisição.
   * @example "Reparo elétrico no bloco A"
   */
  @IsString()
  title: string;

  /**
   * Descrição detalhada da requisição.
   * @example "Lâmpadas queimadas e fiação exposta na sala 101 do bloco A."
   */
  @IsString()
  description: string;

  /**
   * Data e hora da solicitação.
   * @example "2023-10-27T10:00:00.000Z"
   */
  @IsDate()
  requestedAt: Date;

  /**
   * Prazo para conclusão da requisição.
   * @example "2023-11-10T17:00:00.000Z"
   */
  @IsDate()
  deadline: Date;

  /**
   * Detalhes da solução aplicada.
   * @example "Substituição das lâmpadas e reparo da fiação."
   */
  @IsOptional()
  @IsString()
  solutionDetails: string;

  /**
   * Data e hora da conclusão da requisição.
   * @example "2023-11-05T14:30:00.000Z"
   */
  @IsOptional()
  @IsDate()
  completedAt: Date;

  /**
   * ID do complexo de instalações relacionado.
   * @example "CAMPUS-CENTRAL"
   */
  @IsString()
  facilityComplexId: string;

  /**
   * ID do espaço relacionado.
   * @example 1
   */
  @IsNumber()
  spaceId: number;

  /**
   * ID do edifício relacionado.
   * @example "BLOCO-A"
   */
  @IsString()
  buildingId: string;

  /**
   * ID do sistema relacionado.
   * @example 1
   */
  @IsNumber()
  systemId: number;

  /**
   * ID da instância de manutenção atual.
   * @example 1
   */
  @IsNumber()
  currentMaintenanceInstanceId: number;

  /**
   * ID do usuário que criou a requisição.
   * @example 1
   */
  @IsNumber()
  createdById: number;

  /**
   * ID do usuário atribuído para resolver a requisição.
   * @example 2
   */
  @IsOptional()
  @IsNumber()
  assignedToId: number;

  /**
   * ID do tipo de serviço necessário.
   * @example 1
   */
  @IsNumber()
  serviceTypeId: number;

  /**
   * ID do diagnóstico associado.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  diagnosisId: number;

  /**
   * Data e hora de criação do registro.
   * @example "2023-10-27T09:00:00.000Z"
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  updatedAt: Date;

  /**
   * Observações adicionais sobre a requisição.
   * @example "Agendar com o responsável pelo bloco."
   */
  @IsOptional()
  @IsString()
  notes: string;

  /**
   * Localização específica da requisição de manutenção.
   * @example "Sala 101, Bloco A"
   */
  @IsString()
  local: string;

  /**
   * Origem da requisição de manutenção (e.g., SIPAC, SISMAN).
   * @example "SISMAN"
   */
  @IsEnum($Enums.MaintenanceRequestOrigin)
  origin: $Enums.MaintenanceRequestOrigin;

  /**
   * ID da unidade de custo do SIPAC.
   * @example 12345
   */
  @IsNumber()
  sipacUnitCostId: number;

  /**
   * ID da unidade requisitante do SIPAC.
   * @example 67890
   */
  @IsNumber()
  sipacUnitRequestingId: number;

  /**
   * Login do usuário solicitante no SIPAC.
   * @example "usuario.login"
   */
  @IsString()
  sipacUserLoginRequest: string;

  /**
   * Usar sobras para requisicao de material (não emite alerta mesmo com defict)
   * @example 1
   */
  @IsOptional()
  @IsBoolean()
  useResidueMaterial: boolean;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaintenanceRequestRelationOnlyArgs =
  Prisma.validator<Prisma.MaintenanceRequestDefaultArgs>()({
    select: {
      currentMaintenanceInstance: true,
      createdBy: true,
      assignedTo: true,
      building: true,
      space: true,
      system: true,
      serviceType: true,
      statuses: true,
      diagnosis: true,
      timelineEvents: true,
      materialRequests: true,
      facilityComplex: true,
      materialStockMovements: true,
      materialWithdrawals: true,
      priorities: true,
      serviceOrders: true,
      sipacUnitCost: true,
      sipacUnitRequesting: true
    }
  });

type MaintenanceRequestRelationsOnly = Prisma.MaintenanceRequestGetPayload<
  typeof MaintenanceRequestRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaintenanceRequestWithRelationsResponseDto
  extends MaintenanceRequestBaseDto
  implements Partial<MaintenanceRequestRelationsOnly>
{
  /**
   * Instância de manutenção associada à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceInstance)
  currentMaintenanceInstance?: MaintenanceRequestRelationsOnly['currentMaintenanceInstance'];

  /**
   * Usuário que criou a requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  createdBy?: MaintenanceRequestRelationsOnly['createdBy'];

  /**
   * Usuário atribuído para resolver a requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  assignedTo?: MaintenanceRequestRelationsOnly['assignedTo'];

  /**
   * Edifício relacionado à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingDto)
  building?: MaintenanceRequestRelationsOnly['building'];

  /**
   * Espaço relacionado à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSpaceDto)
  space?: MaintenanceRequestRelationsOnly['space'];

  /**
   * Sistema relacionado à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSystemDto)
  system?: MaintenanceRequestRelationsOnly['system'];

  /**
   * Tipo de serviço associado à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceServiceTypeDto)
  serviceType?: MaintenanceRequestRelationsOnly['serviceType'];

  /**
   * Status da requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceRequestStatusDto)
  statuses?: MaintenanceRequestRelationsOnly['statuses'];

  /**
   * Diagnóstico associado à requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureOccurrenceDiagnosisDto)
  diagnosis?: MaintenanceRequestRelationsOnly['diagnosis'];

  /**
   * Eventos da linha do tempo da requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceTimelineEventDto)
  timelineEvents?: MaintenanceRequestRelationsOnly['timelineEvents'];

  /**
   * Requisições de material associadas.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestWithRelationsDto)
  materialRequests?: MaintenanceRequestRelationsOnly['materialRequests'];

  facilityComplex?: MaintenanceRequestRelationsOnly['facilityComplex'];

  materialStockMovements?: MaintenanceRequestRelationsOnly['materialStockMovements'];

  materialWithdrawals?: MaintenanceRequestRelationsOnly['materialWithdrawals'];

  priorities?: MaintenanceRequestRelationsOnly['priorities'];

  serviceOrders?: MaintenanceRequestRelationsOnly['serviceOrders'];

  sipacUnitCost?: MaintenanceRequestRelationsOnly['sipacUnitCost'];

  sipacUnitRequesting?: MaintenanceRequestRelationsOnly['sipacUnitRequesting'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaintenanceRequestDto extends IntersectionType(
  PartialType(MaintenanceRequestBaseDto),
  PickType(MaintenanceRequestBaseDto, ['protocolNumber', 'title'] as const)
) {}

export class CreateMaintenanceRequestWithRelationsDto extends CreateMaintenanceRequestDto {
  /**
   * Instância de manutenção atual que está lidando com a requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceInstance)
  currentMaintenanceInstance?: UpdateMaintenanceInstance;

  /**
   * Usuário que formalmente abriu esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  createdBy?: UpdateUserDto;

  /**
   * Usuário (técnico) atribuído a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  assignedTo?: UpdateUserDto;

  /**
   * Complexo de instalações (campus) relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureFacilityComplexDto)
  facilityComplex?: UpdateInfrastructureFacilityComplexDto;

  /**
   * Edifício relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingDto)
  building?: UpdateInfrastructureBuildingDto;

  /**
   * Espaço relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSpaceDto)
  space?: UpdateInfrastructureSpaceDto;

  /**
   * Sistema de infraestrutura relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSystemDto)
  system?: UpdateInfrastructureSystemDto;

  // /**
  //  * Equipamento relacionado a esta requisição.
  //  */
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => UpdateEquipmentDto)
  // equipment?: UpdateEquipmentDto;

  /**
   * Tipo de serviço necessário para esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceServiceTypeDto)
  serviceType?: UpdateMaintenanceServiceTypeDto;

  /**
   * Status da requisição de manutenção.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceRequestStatusDto)
  statuses?: UpdateMaintenanceRequestStatusDto;

  /**
   * Diagnóstico associado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureOccurrenceDiagnosisDto)
  diagnosis?: UpdateInfrastructureOccurrenceDiagnosisDto;

  /**
   * Histórico de eventos/ações relacionados a esta requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceTimelineEventDto)
  timelineEvents?: CreateMaintenanceTimelineEventDto[];

  /**
   * Requisições de material associadas a esta requisição de manutenção.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialRequestWithRelationsDto)
  materialRequests?: UpdateMaterialRequestWithRelationsDto[];

  //TODO:
  /**
   * Dados da unidade SIPAC requisitante.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitRequesting?: MaintenanceRequestRelationsOnly['sipacUnitRequesting'];

  //TODO:
  /**
   * Dados da unidade de custo SIPAC.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitCost?: MaintenanceRequestRelationsOnly['sipacUnitCost'];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaintenanceRequestDto extends PartialType(
  CreateMaintenanceRequestDto
) {}

export class UpdateMaintenanceRequestWithRelationsDto extends PartialType(
  CreateMaintenanceRequestWithRelationsDto
) {}
