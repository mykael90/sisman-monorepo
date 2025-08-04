import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

export class CreateSipacImovelDto implements Prisma.SipacImovelCreateManyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rip: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nomeImovel: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tipoVocacao: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tipoFormaAquisicao: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tipoImovel: string;
}

export class UpdateMaterialDto extends PartialType(CreateSipacImovelDto) {}

export class createSipacImovelEnderecoDto
  implements Prisma.SipacImovelEnderecoCreateManyInput
{
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  municipio: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bairro: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  logradouro: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  complemento: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cep: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ripImovel: string;
}

export class createSipacCampusDto implements Prisma.SipacCampusCreateManyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nomeCampus: string;
}

export class createSipacImovelDtoWithRelations extends CreateSipacImovelDto {
  @ApiProperty({
    description: 'endereco',
    required: false,
    type: createSipacImovelEnderecoDto
  })
  @IsOptional()
  @Type(() => createSipacImovelEnderecoDto) // Transform plain objects to instances
  endereco?: createSipacImovelEnderecoDto;

  @ApiProperty({
    description: 'campus',
    required: false,
    type: createSipacCampusDto
  })
  @IsOptional()
  @Type(() => createSipacCampusDto) // Transform plain objects to instances
  campus?: createSipacCampusDto;
}
