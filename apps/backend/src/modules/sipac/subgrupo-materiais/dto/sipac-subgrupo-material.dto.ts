import { IsBoolean, IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSipacSubGrupoMaterialDto {
  @ApiProperty({
    description: 'Código do subgrupo de material',
    example: 1234567890
  })
  @IsNumber()
  codigo: number;

  @ApiProperty({
    description: 'Denominação do subgrupo de material',
    example: 'PAPELARIA'
  })
  @IsString()
  denominacao: string;

  @ApiProperty({
    description: 'ID do grupo de material pai',
    example: 1001
  })
  @IsNumber()
  idGrupoMaterial: number;

  @ApiProperty({
    description: 'ID único do subgrupo de material',
    example: 2001
  })
  @IsNumber()
  idSubGrupoMaterial: number;
}

export class CreateManySipacSubGrupoMaterialDto {
  @ApiProperty({ type: [CreateSipacSubGrupoMaterialDto] })
  @IsArray()
  items: CreateSipacSubGrupoMaterialDto[];
}
