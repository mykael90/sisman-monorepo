import { ApiProperty, PartialType } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Nome do depósito transitório',
    example: 'Depósito transitório Central'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'ID do depósito transitório (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Código do depósito transitório',
    example: 'AZM001',
    required: false
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Localização do depósito transitório',
    example: 'Rua Principal, 123',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Indica se o depósito transitório está ativo',
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
