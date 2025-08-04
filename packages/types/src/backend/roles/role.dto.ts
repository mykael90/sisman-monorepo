import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, Role } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { UpdateUserDto, UserWithRelationsResponseDto } from '../users/user.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class RoleBaseDto implements Role {
  /**
   * ID único do papel.
   * @example 100
   */
  @IsNumber()
  id: number;

  /**
   * Descrição detalhada do que o papel representa.
   * @example Acesso total ao sistema, permissões administrativas.
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * Nome único do papel (usado para identificação).
   * @example Administrator
   */
  @IsString()
  @IsNotEmpty()
  role: string;

  /**
   * Data de criação do registro.
   * @example 2023-10-27T10:00:00.000Z
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example 2023-11-05T15:00:00.000Z
   */
  @IsDate()
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const RoleRelationOnlyArgs = Prisma.validator<Prisma.RoleDefaultArgs>()({
  select: {
    users: true
  }
});

type RoleRelationsOnly = Prisma.RoleGetPayload<typeof RoleRelationOnlyArgs>;

export class RoleResponseDto extends RoleBaseDto {};

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */
export class RoleWithRelationsResponseDto
  extends RoleBaseDto
  implements Partial<RoleRelationsOnly>
{
  /**
   * Lista de usuários associados a este papel.
   */
  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UpdateUserDto) // Usando um DTO de usuário para validação aninhada
  users?: UserWithRelationsResponseDto[];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================
export class CreateRoleDto extends IntersectionType(
  PartialType(RoleBaseDto),
  PickType(RoleBaseDto, ['id','description', 'role'] as const)) {}

export class CreateRoleWithRelationsDto extends CreateRoleDto {
  /**
   * Lista de usuários a serem conectados a este papel na criação.
   * Forneça um array de objetos, cada um com o `id` do usuário.
   * @example [{ "id": 1 }, { "id": 2 }]
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserDto) // Reutilizando UpdateUserDto para conectar por ID
  users?: UpdateUserDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateRoleWithRelationsDto extends PartialType(
  CreateRoleWithRelationsDto
) {}
