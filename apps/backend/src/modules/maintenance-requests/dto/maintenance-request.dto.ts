import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  $Enums,
  Prisma,
  RequestPriority,
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
  ValidateIf,
  IsArray,
  ValidateNested,
  IsBoolean
} from 'class-validator';
import { UpdateSipacUnidadeDto } from '../../sipac/unidades/dto/sipac-unidade.dto'; // Assuming this is still relevant for related entities like SipacUnit
import { UpdateUserDto } from '../../users/dto/user.dto'; // Assuming User DTO exists
import { UpdateEquipmentDto } from '../../equipments/dto/equipment.dto'; // Assuming Equipment DTO exists
import { UpdateMaintenanceInstance } from '../../maintenance-instances/dto/maintenance-instance.dto'; // Assuming this DTO exists
import { UpdateInfrastructureOccurrenceDto } from '../../infrastructure-occurrences/dto/infrastructure-occurrence.dto'; // Assuming this DTO exists
import { UpdateBuildingDto } from '../../buildings/dto/building.dto';
import { UpdateSpaceDto } from '../../spaces/dto/space.dto';
import { UpdateInfrastructureSystemDto } from '../../infrastructure-systems/dto/infrastructure-system.dto';
import { UpdateDiagnosisDto } from '../../diagnoses/dto/diagnosis.dto';
import { UpdateServiceTypeDto } from '../../service-types/dto/service-type.dto';
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
      | 'equipmentId'
      | 'serviceTypeId'
      | 'diagnosisId'
    >
{
  @ApiProperty({
    description:
      'ID da requisição de manutenção (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Número do protocolo da requisição',
    example: 'MANUT-2023/001',
    required: false
  })
  @IsOptional()
  @IsString()
  protocolNumber?: string;

  @ApiProperty({
    description: 'Título da requisição',
    example: 'Reparo de vazamento no banheiro do Bloco A',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do problema ou solicitação',
    example:
      'Há um vazamento constante na pia do banheiro masculino do segundo andar do Bloco A.',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Prioridade da requisição',
    enum: RequestPriority,
    example: RequestPriority.NORMAL,
    required: false
  })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiProperty({
    description: 'Data e hora da solicitação (formato ISO 8601)',
    example: '2023-10-27T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  requestedAt?: string | Date;

  @ApiProperty({
    description: 'Prazo final para conclusão da requisição (formato ISO 8601)',
    example: '2023-11-15T17:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  deadline?: string | Date;

  @ApiProperty({
    description: 'Detalhes da solução fornecida',
    example: 'Vazamento corrigido com a troca da vedação da torneira.',
    required: false
  })
  @IsOptional()
  @IsString()
  solutionDetails?: string;

  @ApiProperty({
    description: 'Data e hora da conclusão da requisição (formato ISO 8601)',
    example: '2023-11-10T14:30:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string | Date;

  @ApiProperty({
    description: 'ID do usuário (técnico) atribuído à requisição',
    example: 7,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  assignedToId?: number;

  @ApiProperty({
    description: 'ID do espaço relacionado à requisição',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  spaceId?: number;

  @ApiProperty({
    description: 'ID do edifício relacionado à requisição',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buildingId?: number;

  @ApiProperty({
    description: 'ID do sistema de infraestrutura relacionado à requisição',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  systemId?: number;

  @ApiProperty({
    description: 'ID do equipamento relacionado à requisição',
    example: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  equipmentId?: number;

  @ApiProperty({
    description: 'ID do tipo de serviço necessário para a requisição',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  serviceTypeId?: number;

  @ApiProperty({
    description: 'ID do diagnóstico associado a esta requisição',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  diagnosisId?: number;

  @ApiProperty({
    description: 'Status atual da requisição de manutenção',
    enum: MaintenanceRequestStatusOptions,
    example: MaintenanceRequestStatusOptions.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(MaintenanceRequestStatusOptions)
  currentStatus?: MaintenanceRequestStatusOptions;
}

export class UpdateMaintenanceRequestStatusDto {
  @ApiProperty({
    description: 'ID do status da requisição de manutenção.',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Nome do status (e.g., "Open", "In Analysis", "Completed").',
    example: 'Open',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição detalhada do status.',
    example: 'Requisição aberta e aguardando atribuição.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indica se este status marca o fim de uma requisição.',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @ApiProperty({
    description: 'Ordem para exibição em interfaces de usuário.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateMaintenanceTimelineEventDto
  implements
    Omit<Prisma.MaintenanceTimelineEventCreateManyInput, 'maintenanceRequestId'>
{
  @ApiProperty({
    description:
      'ID do evento da linha do tempo (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'ID do usuário que realizou a ação/registrou o evento.',
    example: 5,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  actionById: number;

  @ApiProperty({
    description: 'Tipo do evento ou ação',
    enum: TimelineEventType,
    example: TimelineEventType.COMMENT,
    required: true
  })
  @IsEnum(TimelineEventType)
  @IsNotEmpty()
  type: TimelineEventType;

  @ApiProperty({
    description: 'Descrição detalhada da ação',
    example:
      'Comentário adicionado: Verificado o local, o vazamento é pequeno.',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Dados estruturados relacionados ao evento (JSON)',
    example: { oldStatus: 'PENDING', newStatus: 'IN_PROGRESS' },
    required: false
  })
  @IsOptional()
  eventData?: Prisma.JsonValue;

  @ApiProperty({
    description: 'Data e hora em que o evento ocorreu (formato ISO 8601)',
    example: '2023-10-27T10:05:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string | Date;

  @ApiProperty({
    description:
      'ID da instância de manutenção de onde foi transferido (se aplicável)',
    example: 1,
    required: false
  })
  @IsNumber()
  @Type(() => Number)
  transferredFromInstanceId: number;

  @ApiProperty({
    description:
      'ID da instância de manutenção para onde foi transferido (se aplicável)',
    example: 2,
    required: false
  })
  @IsNumber()
  @Type(() => Number)
  transferredToInstanceId: number;
}

export class CreateMaintenanceRequestWithRelationsDto extends CreateMaintenanceRequestDto {
  @ApiProperty({
    type: () => UpdateMaintenanceInstance,
    description:
      'Instância de manutenção atual que está lidando com a requisição.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateMaintenanceInstance)
  currentMaintenanceInstance: UpdateMaintenanceInstance;

  @ApiProperty({
    type: () => UpdateUserDto,
    description: 'Usuário que formalmente abriu esta requisição.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  createdBy: UpdateUserDto;

  @ApiProperty({
    type: () => UpdateUserDto,
    description: 'Usuário (técnico) atribuído a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  assignedTo?: UpdateUserDto;

  @ApiProperty({
    type: () => UpdateSpaceDto,
    description: 'Espaço relacionado a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSpaceDto)
  space?: UpdateSpaceDto;

  @ApiProperty({
    type: () => UpdateBuildingDto,
    description: 'Edifício relacionado a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBuildingDto)
  building?: UpdateBuildingDto;

  @ApiProperty({
    type: () => UpdateInfrastructureSystemDto,
    description: 'Sistema de infraestrutura relacionado a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSystemDto)
  system?: UpdateInfrastructureSystemDto;

  @ApiProperty({
    type: () => UpdateEquipmentDto,
    description: 'Equipamento relacionado a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEquipmentDto)
  equipment?: UpdateEquipmentDto;

  @ApiProperty({
    type: () => UpdateServiceTypeDto,
    description: 'Tipo de serviço necessário para esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateServiceTypeDto)
  serviceType?: UpdateServiceTypeDto;

  @ApiProperty({
    type: () => UpdateMaintenanceRequestStatusDto, // Assuming a DTO for MaintenanceRequestStatus
    description: 'Status da requisição de manutenção.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateMaintenanceRequestStatusDto)
  status: UpdateMaintenanceRequestStatusDto;

  @ApiProperty({
    type: () => UpdateDiagnosisDto,
    description: 'Diagnóstico associado a esta requisição.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDiagnosisDto)
  diagnosis?: UpdateDiagnosisDto;

  @ApiProperty({
    type: () => [UpdateInfrastructureOccurrenceDto],
    description:
      'Ocorrências de infraestrutura que originaram esta requisição.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureOccurrenceDto)
  originatingOccurrences?: UpdateInfrastructureOccurrenceDto[];

  @ApiProperty({
    type: () => [CreateMaintenanceTimelineEventDto],
    description: 'Histórico de eventos/ações relacionados a esta requisição.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceTimelineEventDto)
  timelineEvents?: CreateMaintenanceTimelineEventDto[];

  // Material requests associated with this maintenance request.
  @ApiProperty({
    type: () => [CreateMaterialRequestWithRelationsDto], // Assuming a DTO for MaterialRequest
    description:
      'Requisições de material associadas a esta requisição de manutenção.',
    required: false
  })
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
  @ApiProperty({
    description: 'ID do evento da linha do tempo (para operação de upsert)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'ID do usuário que realizou a ação/registrou o evento.',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  actionById?: number;
}

export class UpdateMaintenanceRequestWithRelationsDto extends PartialType(
  CreateMaintenanceRequestWithRelationsDto
) {}
