import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

// Omitimos createdAt e updatedAt do DTO de criação, pois são geralmente gerenciados pelo Prisma.
// Se Prisma.SipacMaterialCreateInput os tiver como obrigatórios (mesmo que opcionais),
// a cláusula 'implements' pode precisar de ajuste, por exemplo, Omit<...>
export class CreateSipacMaterialDto
  implements Prisma.SipacMaterialCreateManyInput
{
  @ApiProperty({
    description: 'Indica se o material está ativo.',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  ativo: boolean;

  @ApiProperty({
    description:
      'Código do material. Proveniente de SipacMaterialResponseItem.codigo (number), transformado para string.',
    example: '12345'
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description:
      "ID do material no SIPAC. Corresponde a SipacMaterialResponseItem['id-material'].",
    example: 789
  })
  @IsNumber()
  @IsNotEmpty()
  idMaterial: number;

  @ApiProperty({
    description:
      "Código SIDEC do material. Proveniente de SipacMaterialResponseItem['codigo-sidec'] (number), transformado para string.",
    example: 'S123',
    required: false
  })
  @IsOptional()
  @IsString()
  codigoSidec?: string;

  @ApiProperty({
    description:
      "Consumo de energia do material. Proveniente de SipacMaterialResponseItem['consumo-energia'].",
    example: 2.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  consumoEnergia?: number;

  // @ApiProperty({
  //   description:
  //     "Data da última compra. Proveniente de SipacMaterialResponseItem['data-ultima-compra'] (timestamp), transformada para Date.",
  //   example: '2023-10-26T10:00:00.000Z',
  //   type: Date
  // })
  // @IsDate()
  // @Type(() => Date) // Garante a transformação para Date (ex: de string ISO)
  // @IsNotEmpty()
  // dataUltimaCompra: Date;

  @ApiProperty({
    description:
      "Denominação do grupo do material. Proveniente de SipacMaterialResponseItem['denominacao-grupo'].",
    example: 'Material de Expediente',
    required: false
  })
  @IsOptional()
  @IsString()
  denominacaoGrupo?: string;

  @ApiProperty({
    description:
      "Denominação do material. Proveniente de SipacMaterialResponseItem['denominacao-material'].",
    example: 'Caneta Azul'
  })
  @IsString()
  @IsNotEmpty()
  denominacaoMaterial: string;

  @ApiProperty({
    description:
      "Denominação ASCII do material. Proveniente de SipacMaterialResponseItem['denominacao-material-ascii'].",
    example: 'CANETA AZUL',
    required: false
  })
  @IsOptional()
  @IsString()
  denominacaoMaterialAscii?: string;

  @ApiProperty({
    description:
      "Denominação do sub-grupo do material. Proveniente de SipacMaterialResponseItem['denominacao-sub-grupo'].",
    example: 'Escrita',
    required: false
  })
  @IsOptional()
  @IsString()
  denominacaoSubGrupo?: string;

  @ApiProperty({
    description:
      "Denominação da unidade de medida. Proveniente de SipacMaterialResponseItem['denominacao-unidade'].",
    example: 'UN',
    required: false
  })
  @IsOptional()
  @IsString()
  denominacaoUnidade?: string;

  @ApiProperty({
    description:
      'Especificação do material. Proveniente de SipacMaterialResponseItem.especificacao.',
    example: 'Ponta fina, cor azul',
    required: false
  })
  @IsOptional()
  @IsString()
  especificacao?: string;

  @ApiProperty({
    description:
      "Especificação ASCII do material. Proveniente de SipacMaterialResponseItem['especificacao-ascii'].",
    example: 'PONTA FINA, COR AZUL',
    required: false
  })
  @IsOptional()
  @IsString()
  especificacaoAscii?: string;

  @ApiProperty({
    description:
      "ID do grupo do material. Proveniente de SipacMaterialResponseItem['id-grupo'].",
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  idGrupo?: number;

  @ApiProperty({
    description:
      "ID do sub-grupo do material. Proveniente de SipacMaterialResponseItem['id-sub-grupo'].",
    example: 101,
    required: false
  })
  @IsOptional()
  @IsNumber()
  idSubGrupo?: number;

  @ApiProperty({
    description:
      "Preço de compra do material. Proveniente de SipacMaterialResponseItem['preco-compra'].",
    example: 1.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  precoCompra?: number;

  @ApiProperty({
    description:
      "Valor estimado do material. Proveniente de SipacMaterialResponseItem['valor-estimado'].",
    example: 1.75,
    required: false
  })
  @IsOptional()
  @IsNumber()
  valorEstimado?: number;
}

export class UpdateSipacMaterialDto extends PartialType(
  CreateSipacMaterialDto
) {}

export class CreateManySipacMaterialDto {
  @ApiProperty({
    description: 'materiais',
    required: false,
    type: [CreateSipacMaterialDto]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => CreateSipacMaterialDto) // Transform plain objects to UpdateRoleDto instances
  items?: CreateSipacMaterialDto[];
}
