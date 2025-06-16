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
import { Type } from 'class-transformer';

export class CreateWarehouseDto implements Prisma.WarehouseCreateManyInput {
  @ApiProperty({ description: 'Nome do armazém', example: 'Armazém Central' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID do armazém (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Código do armazém',
    example: 'AZM001',
    required: false
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Localização do armazém',
    example: 'Rua Principal, 123',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Indica se o armazém está ativo',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'ID da instância de manutenção associada',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // Garante a transformação para Number
  maintenanceInstanceId: number;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
