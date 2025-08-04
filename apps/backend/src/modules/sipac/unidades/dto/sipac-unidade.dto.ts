import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';

// Omitimos createdAt e updatedAt do DTO de criação, pois são geralmente gerenciados pelo Prisma.
// Se Prisma.SipacMaterialCreateInput os tiver como obrigatórios (mesmo que opcionais),
// a cláusula 'implements' pode precisar de ajuste, por exemplo, Omit<...>
export class CreateSipacUnidadeDto
  implements Prisma.SipacUnidadeCreateManyInput
{
  @ApiProperty({
    description:
      'Identificador único da unidade (deve ser fornecido se não for autogerado)',
    example: 12345
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  codigoUnidade: string;

  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Superintendência de Infraestrutura'
  })
  @IsNotEmpty()
  @IsString()
  nomeUnidade: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sigla?: string;
}

export class UpdateSipacUnidadeDto extends PartialType(CreateSipacUnidadeDto) {}

export class CreateManySipacUnidadeDto {
  @ApiProperty({
    description: 'unidades',
    required: false,
    type: [CreateSipacUnidadeDto]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => CreateSipacUnidadeDto) // Transform plain objects to UpdateRoleDto instances
  items?: CreateSipacUnidadeDto[];
}
