import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSipacPredioDto implements Prisma.SipacPredioCreateManyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subRip: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  denominacaoPredio: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  idZona?: string;

  @IsOptional()
  ripImovel: string;

  @IsOptional()
  latitude?: string | number | DecimalJsLike | Prisma.Decimal;

  @IsOptional()
  longitude?: string | number | DecimalJsLike | Prisma.Decimal;
}
