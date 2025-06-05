import { IsBoolean, IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSipacGrupoMaterialDto {
  @ApiProperty({
    description: 'Indica se o grupo de material está ativo',
    example: true
  })
  @IsBoolean()
  ativo: boolean;

  @ApiProperty({
    description: 'Código do grupo de material',
    example: 1234567890
  })
  @IsNumber()
  codigo: number;

  @ApiProperty({
    description: 'Denominação do grupo de material',
    example: 'MATERIAIS DE ESCRITORIO'
  })
  @IsString()
  denominacao: string;

  @ApiProperty({
    description: 'Descrição detalhada do grupo de material',
    example: 'Materiais diversos utilizados em atividades de escritório.'
  })
  @IsString()
  descricao: string;

  @ApiProperty({
    description: 'ID do elemento de despesa associado',
    example: 339030
  })
  @IsNumber()
  idElementoDespesa: number;

  @ApiProperty({
    description: 'ID único do grupo de material',
    example: 1001
  })
  @IsNumber()
  idGrupoMaterial: number;
}

export class CreateManySipacGrupoMaterialDto {
  @ApiProperty({ type: [CreateSipacGrupoMaterialDto] })
  @IsArray()
  items: CreateSipacGrupoMaterialDto[];
}
