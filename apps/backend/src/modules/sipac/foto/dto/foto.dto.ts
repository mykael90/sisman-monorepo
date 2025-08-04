import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FetchFotoDto {
  @ApiProperty({
    description: 'O ID de produção da foto no SIPAC.',
    example: '12345'
  })
  @IsString({ message: 'O campo idProducao deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo idProducao não pode estar vazio.' })
  idProducao: string;

  @ApiProperty({
    description: 'A chave de acesso para a foto no SIPAC.',
    example: 'abcdef123456'
  })
  @IsString({ message: 'O campo key deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo key não pode estar vazio.' })
  key: string;
}
