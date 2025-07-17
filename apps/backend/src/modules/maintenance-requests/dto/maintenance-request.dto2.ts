import { PartialType } from '@nestjs/swagger';
import {
  Prisma,
  MaintenanceRequestStatusOptions,
  TimelineEventType
} from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDate
} from 'class-validator';
import { UpdateSipacUnidadeDto } from '../../sipac/unidades/dto/sipac-unidade.dto'; // Assuming this is still relevant for related entities like SipacUnit
import { UpdateUserDto } from '../../users/dto/user.dto'; // Assuming User DTO exists
// import { UpdateEquipmentDto } from '../../equipments/dto/equipment.dto'; // Assuming Equipment DTO exists
import { UpdateMaintenanceInstance } from '../../maintenance-instances/dto/maintenance-instance.dto'; // Assuming this DTO exists
import { UpdateInfrastructureOccurrenceDto } from '../../infrastructure-occurrences/dto/infrastructure-occurrence.dto'; // Assuming this DTO exists
import { UpdateInfrastructureBuildingDto } from '../../infrastructure-buildings/dto/infrastructure-building.dto';
import { UpdateInfrastructureSpaceDto } from '../../infrastructure-spaces/dto/infrastructure-space.dto';
import { UpdateInfrastructureSystemDto } from '../../infrastructure-systems/dto/infrastructure-system.dto';
import { UpdateInfrastructureOccurrenceDiagnosisDto } from '../../infrastructure-occurrence-diagnosis/dto/infrastructure-occurrence-diagnosis.dto';
import { UpdateMaintenanceServiceTypeDto } from '../../maintenance-service-types/dto/maintenance-service-type.dto';
import { CreateMaterialRequestWithRelationsDto } from '../../material-requests/dto/material-request.dto';
import { UpdateMaintenanceRequestStatusDto } from '../../maintenance-request-statuses/dto/maintenance-request-status.dto';
import { CreateMaintenanceTimelineEventDto } from '../../maintenance-timeline-events/dto/maintenance-timeline-event.dto';

export class CreateMaintenanceRequestDto
  implements
    Omit<
      Prisma.MaintenanceRequestCreateManyInput,
      | 'currentMaintenanceInstanceId'
      | 'createdById'
      | 'statusId'
      | 'spaceId'
      | 'buildingId'
      | 'systemId'
      // | 'equipmentId'
      | 'serviceTypeId'
      | 'diagnosisId'
    >
{
  /**
   * ID da requisição de manutenção (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Número do protocolo da requisição
   * @example 'MANUT-2023/001'
   */
  @IsOptional()
  @IsString()
  protocolNumber?: string;

  /**
   * Título da requisição
   * @example 'Reparo de vazamento no banheiro do Bloco A'
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * Descrição detalhada do problema ou solicitação
   * @example 'Há um vazamento constante na pia do banheiro masculino do segundo andar do Bloco A.'
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Data e hora da solicitação (formato ISO 8601)
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  requestedAt?: string | Date;

  /**
   * Prazo final para conclusão da requisição (formato ISO 8601)
   * @example '2023-11-15T17:00:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  deadline?: string | Date;

  /**
   * Detalhes da solução fornecida
   * @example 'Vazamento corrigido com a troca da vedação da torneira.'
   */
  @IsOptional()
  @IsString()
  solutionDetails?: string;

  /**
   * Data e hora da conclusão da requisição (formato ISO 8601)
   * @example '2023-11-10T14:30:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  completedAt?: string | Date;

  /**
   * ID do usuário (técnico) atribuído à requisição
   * @example 7
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  assignedToId?: number;

  /**
   * ID do espaço relacionado à requisição
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  spaceId?: number;

  /**
   * ID do edifício relacionado à requisição
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buildingId?: number;

  /**
   * ID do sistema de infraestrutura relacionado à requisição
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  systemId?: number;

  // /**
  //  * ID do equipamento relacionado à requisição
  //  * @example 20
  //  */
  // @IsOptional()
  // @IsNumber()
  // @Type(() => Number)
  // equipmentId?: number;

  /**
   * ID do tipo de serviço necessário para a requisição
   * @example 3
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  serviceTypeId?: number;

  /**
   * ID do diagnóstico associado a esta requisição
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  diagnosisId?: number;
}
export class CreateMaintenanceRequestWithRelationsDto extends CreateMaintenanceRequestDto {
  /**
   * Instância de manutenção atual que está lidando com a requisição.
   */
  @ValidateNested()
  @Type(() => UpdateMaintenanceInstance)
  currentMaintenanceInstance: UpdateMaintenanceInstance;

  /**
   * Usuário que formalmente abriu esta requisição.
   */
  @ValidateNested()
  @Type(() => UpdateUserDto)
  createdBy: UpdateUserDto;

  /**
   * Usuário (técnico) atribuído a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  assignedTo?: UpdateUserDto;

  /**
   * Espaço relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSpaceDto)
  space?: UpdateInfrastructureSpaceDto;

  /**
   * Edifício relacionado a esta requisição.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingDto)
  building?: UpdateInfrastructureBuildingDto;

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
  @ValidateNested()
  @Type(() => UpdateMaintenanceRequestStatusDto)
  statuses: UpdateMaintenanceRequestStatusDto;

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
  @Type(() => CreateMaterialRequestWithRelationsDto)
  materialRequests?: CreateMaterialRequestWithRelationsDto[];
}

export class UpdateMaintenanceRequestDto extends PartialType(
  CreateMaintenanceRequestDto
) {}

export class UpdateMaintenanceRequestWithRelationsDto extends PartialType(
  CreateMaintenanceRequestWithRelationsDto
) {}
