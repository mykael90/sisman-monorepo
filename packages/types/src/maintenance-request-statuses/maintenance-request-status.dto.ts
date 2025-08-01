import { MaintenanceRequestStatusOptions, Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

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
