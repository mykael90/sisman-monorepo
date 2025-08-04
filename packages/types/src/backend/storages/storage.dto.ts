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

export class CreateStorageDto implements Prisma.StorageCreateManyInput {
  @ApiProperty({
    description:
      'ID do centro de distribuição (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Nome do centro de distribuição',
    example: 'Almoxarifado Central'
  })
  @IsString()
  name: string;
}

export class UpdateStorageDto extends PartialType(CreateStorageDto) {}
