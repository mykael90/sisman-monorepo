import { OmitType, PartialType } from '@nestjs/swagger';
import { Prisma, Role } from '@sisman/prisma';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class RoleBaseDto implements Role {
  /**
   * ID único do papel.
   * @example 1
   */
  id: number;

  /**
   * Descrição detalhada do que o papel representa.
   * @example Acesso total ao sistema, permissões administrativas.
   */
  description: string;

  /**
   * Nome único do papel (usado para identificação).
   * @example Administrator
   */
  role: string;
  createdAt: Date;

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

export class RoleResponseDto extends RoleBaseDto {}

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
  users?: RoleRelationsOnly['users'];
  // TODO: Substituir 'Object' por um 'UserResponseDto' para melhor documentação.
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================
export class CreateRoleDto
  extends OmitType(RoleBaseDto, ['createdAt', 'updatedAt'])
  implements Prisma.RoleCreateManyInput {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
