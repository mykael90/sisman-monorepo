import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, User } from '@sisman/prisma';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRoleDto } from '../roles/role.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class UserBaseDto implements User {
  /**
   * Data de criação do registro do usuário.
   * @example 2023-10-27T10:00:00.000Z
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro do usuário.
   * @example 2023-11-05T15:00:00.000Z
   */
  @IsDate()
  updatedAt: Date;

  /**
   * ID único do usuário.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Nome completo do usuário.
   * @example "João da Silva"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Login único do usuário no sistema.
   * @example "joao.silva"
   */
  @IsNotEmpty()
  @IsString()
  login: string;

  /**
   * Endereço de e-mail único do usuário.
   * @example "joao.silva@example.com"
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * URL da imagem de perfil do usuário.
   * @example "https://example.com/path/to/image.jpg"
   */
  @IsOptional()
  @IsString()
  image: string | null;

  /**
   * Indica se o usuário está ativo no sistema.
   * @example true
   */
  @IsBoolean()
  isActive: boolean;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const UserRelationOnlyArgs =
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      roles: true
    }
  });

  type UserRelationsOnly = Prisma.UserGetPayload<typeof UserRelationOnlyArgs>;


/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class UserWithRelationsResponseDto
  extends UserBaseDto
  implements Partial<UserRelationsOnly>
{
  /**
   * Lista de papéis (roles) associados ao usuário.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => UpdateRoleDto) // Transform plain objects to UpdateRoleDto instances
  roles?: UserRelationsOnly['roles'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateUserDto extends IntersectionType(
  PartialType(UserBaseDto),
  PickType(UserBaseDto, ['name', 'login', 'email'] as const)
) {}

export class CreateUserWithRelationsDto extends CreateUserDto {
  /**
   * Lista de papéis (roles) a serem associados ao usuário na criação.
   * @example [{ "id": 1 }]
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => UpdateRoleDto) // Transform plain objects to UpdateRoleDto instances
  roles?: UpdateRoleDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================


export class UpdateUserDto extends PartialType(CreateUserDto) {
}

export class UpdateUserWithRelationsDto extends PartialType(
  CreateUserWithRelationsDto
) {
}
