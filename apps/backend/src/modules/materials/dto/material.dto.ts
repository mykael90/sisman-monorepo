import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { isNumber } from 'lodash';

export class CreateMaterialDto
  implements Prisma.MaterialGlobalCatalogCreateManyInput
{
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  // @IsOptional()
  // @IsString()
  // code?: string;

  @IsOptional()
  @IsString()
  codeSidec?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsNotEmpty()
  @IsString()
  unitOfMeasure: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsNumber()
  @IsOptional()
  groupId?: number;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

export class FindAllMaterialQueryDto {
  /**
   * Id do depósito associado a requisição para filtragem.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  warehouseId: number;
}
export class FindAllMaterialByWarehouseIdQueryDto {
  /**
   * Define se é para mostrar apenas os materiais que já tenham sido movimentados pelo depósito.
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  onlyWarehouse: boolean;
}
