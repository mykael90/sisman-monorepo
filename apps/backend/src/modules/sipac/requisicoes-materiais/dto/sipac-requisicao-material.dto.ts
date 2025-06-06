import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDate,
  IsDecimal
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@sisman/prisma';

export class CreateSipacListaRequisicaoMaterialDto extends Prisma.SipacRequisicaoCreateManyInput {
  @IsNotEmpty()
  @IsDate()
  dataDeCadastro: Date;

  @IsNotEmpty()
  @IsString()
  numeroDaRequisicao: string;

  @IsNotEmpty()
  @IsString()
  unidadeRequisitante: string;

  @IsNotEmpty()
  @IsString()
  unidadeDeCusto: string;

  @IsOptional()
  @IsString()
  grupoDeMaterial: string;

  @IsNotEmpty()
  @IsString()
  tipoDaRequisicao: string;

  @IsNotEmpty()
  @IsString()
  almoxarifado: string;

  @IsNotEmpty()
  @IsString()
  statusAtual: string;

  @IsNotEmpty()
  @IsString()
  usuarioLogin: string;

  @IsNotEmpty()
  @IsDecimal()
  valorDaRequisicao: number;

  @IsNotEmpty()
  @IsString()
  id: number;
}

export class CreateManySipacListaRequisicaoMaterialDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacListaRequisicaoMaterialDto)
  items: CreateSipacListaRequisicaoMaterialDto[];
}
