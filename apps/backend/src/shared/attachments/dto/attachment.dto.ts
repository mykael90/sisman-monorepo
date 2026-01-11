import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';
import { Attachment, Prisma } from '@sisman/prisma';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class AttachmentBaseDto implements Attachment {
  /**
   * ID único do anexo (UUID).
   * @example "cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * Data de criação do registro.
   * @example "2023-11-01T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example "2023-11-02T15:30:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  /**
   * ID do usuário que realizou o upload.
   * @example 123
   */
  @IsInt()
  @IsNotEmpty()
  userId: number;

  /**
   * Tipo MIME do arquivo.
   * @example "image/jpeg"
   */
  @IsString()
  @IsNotEmpty()
  fileType: string;

  /**
   * Nome original do arquivo enviado.
   * @example "foto-perfil.jpg"
   */
  @IsString()
  @IsNotEmpty()
  originalFileName: string;

  /**
   * Nome do arquivo armazenado no sistema (geralmente um hash ou UUID).
   * @example "a1b2c3d4e5f6.jpg"
   */
  @IsString()
  @IsNotEmpty()
  storedFileName: string;

  /**
   * URL pública ou privada para acesso ao arquivo.
   * @example "https://storage.exemplo.com/uploads/a1b2c3d4e5f6.jpg"
   */
  @IsString()
  @IsNotEmpty()
  url: string;

  /**
   * Caminho local ou relativo no sistema de arquivos.
   * @example "/storage/uploads/a1b2c3d4e5f6.jpg"
   */
  @IsString()
  @IsNotEmpty()
  localPath: string;

  /**
   * Tamanho do arquivo em bytes.
   * @example 102456
   */
  @IsInt()
  @IsNotEmpty()
  sizeInBytes: number;

  /**
   * Extensão do arquivo.
   * @example ".jpg"
   */
  @IsString()
  @IsNotEmpty()
  fileExtension: string;

  /**
   * Largura da imagem (se aplicável).
   * @example 1920
   */
  @IsOptional()
  @IsInt()
  width: number;

  /**
   * Altura da imagem (se aplicável).
   * @example 1080
   */
  @IsOptional()
  @IsInt()
  height: number;

  /**
   * ID do modelo relacionado a este anexo.
   * @example "cln28u3vj00003b6w5q1p4s7b"
   */
  @IsNotEmpty()
  @IsString()
  relatedId: string;

  /**
   * Nome do modelo relacionado (ex: Survey, User, MaintenanceRequest).
   * @example "Survey"
   */
  @IsEnum(Prisma.ModelName)
  @IsNotEmpty()
  relatedModel: Prisma.ModelName;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

export class AttachmentResponseDto extends AttachmentBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateAttachmentDto extends PickType(AttachmentBaseDto, [
  'relatedModel',
  'relatedId'
] as const) {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateAttachmentDto extends PartialType(CreateAttachmentDto) {
  /**
   * ID do anexo que será atualizado.
   * @example "cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;
}

// TODO: REFACTOR LATER

export class FindAttachmentsDto {
  @ApiPropertyOptional({ description: 'ID do modelo relacionado' })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({
    description: 'Nome do modelo relacionado (ex: User, Order)'
  })
  @IsOptional()
  @IsString()
  relatedModel?: string;

  @ApiPropertyOptional({ description: 'ID do usuário criador' })
  @IsOptional()
  @IsNumberString() // Aceita string numérica vinda da URL
  userId?: number;
}
