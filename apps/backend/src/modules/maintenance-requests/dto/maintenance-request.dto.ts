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

export class CreateMaintenanceTimelineEventDto
  implements
    Omit<Prisma.MaintenanceTimelineEventCreateManyInput, 'maintenanceRequestId'>
{
  /**
   * ID do evento da linha do tempo (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * ID do usuário que realizou a ação/registrou o evento.
   * @example 5
   */
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  actionById: number;

  /**
   * Tipo do evento ou ação
   * @example 'COMMENT'
   */
  @IsEnum(TimelineEventType)
  @IsNotEmpty()
  type: TimelineEventType;

  /**
   * Descrição detalhada da ação
   * @example 'Comentário adicionado: Verificado o local, o vazamento é pequeno.'
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * Dados estruturados relacionados ao evento (JSON)
   * @example { oldStatus: 'PENDING', newStatus: 'IN_PROGRESS' }
   */
  @IsOptional()
  eventData?: Prisma.JsonValue;

  /**
   * Data e hora em que o evento ocorreu (formato ISO 8601)
   * @example '2023-10-27T10:05:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  occurredAt?: string | Date;

  /**
   * ID da instância de manutenção de onde foi transferido (se aplicável)
   * @example 1
   */
  @IsNumber()
  @Type(() => Number)
  transferredFromInstanceId: number;

  /**
   * ID da instância de manutenção para onde foi transferido (se aplicável)
   * @example 2
   */
  @IsNumber()
  @Type(() => Number)
  transferredToInstanceId: number;
}

export class CreateMaintenanceRequestStatusDto
  implements Prisma.MaintenanceRequestStatusCreateManyInput
{
  /**
   * O status da requisição.
   */
  @IsEnum(MaintenanceRequestStatusOptions)
  @IsNotEmpty()
  status: MaintenanceRequestStatusOptions;

  @IsNumber()
  @Type(() => Number)
  maintenanceRequestId: number;

  /**
   * Descrição do status.
   * @example 'Requisição criada e aguardando atribuição.'
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Indica se este status é um status final para a requisição.
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFinal?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsDate()
  changeDate?: string | Date;

  @IsOptional()
  @IsDate()
  createdAt?: string | Date;

  @IsOptional()
  @IsDate()
  updatedAt?: string | Date;
}

export class UpdateMaintenanceRequestStatusDto extends PartialType(
  CreateMaintenanceRequestStatusDto
) {}

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
   * Ocorrências de infraestrutura que originaram esta requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureOccurrenceDto)
  originatingOccurrences?: UpdateInfrastructureOccurrenceDto[];

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

export class UpdateMaintenanceTimelineEventDto extends PartialType(
  CreateMaintenanceTimelineEventDto
) {
  /**
   * ID do evento da linha do tempo (para operação de upsert)
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * ID do usuário que realizou a ação/registrou o evento.
   * @example 5
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  actionById?: number;
}

export class UpdateMaintenanceRequestWithRelationsDto extends PartialType(
  CreateMaintenanceRequestWithRelationsDto
) {}
