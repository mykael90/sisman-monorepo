import { PartialType } from '@nestjs/swagger';
import { Prisma, TimelineEventType } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

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
