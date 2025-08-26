import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, Worker } from '@sisman/prisma';
import {
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
import { UpdateMaintenanceInstance } from '../../maintenance-instances/dto/maintenance-instance.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// =================================================================

/**
 * Classe base para Worker.
 * @hidden
 */
class WorkerBaseDto implements Worker {
  /**
   * Data de criação do registro do trabalhador.
   * @example 2023-10-27T10:00:00.000Z
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro do trabalhador.
   * @example 2023-11-05T15:00:00.000Z
   */
  @IsDate()
  updatedAt: Date;

  /**
   * ID único do trabalhador.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Nome completo do trabalhador.
   * @example "Carlos Oliveira"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Endereço de e-mail do trabalhador.
   * @example "carlos.oliveira@example.com"
   */
  @IsOptional()
  @IsEmail()
  email: string | null;

  /**
   * Data de nascimento do trabalhador.
   * @example "1985-05-15T00:00:00.000Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthdate: Date | null;

  /**
   * URL da foto do trabalhador.
   * @example "https://example.com/path/to/photo.jpg"
   */
  @IsOptional()
  @IsString()
  urlPhoto: string | null;

  /**
   * RG do trabalhador.
   * @example "123456789"
   */
  @IsOptional()
  @IsString()
  rg: string | null;

  /**
   * CPF do trabalhador.
   * @example "123.456.789-00"
   */
  @IsOptional()
  @IsString()
  cpf: string | null;

  /**
   * Telefone do trabalhador.
   * @example "11987654321"
   */
  @IsOptional()
  @IsString()
  phone: string | null;

  /**
   * Indica se o trabalhador está ativo.
   * @example true
   */
  @IsBoolean()
  isActive: boolean;

  /**
   * Observações sobre o trabalhador.
   * @example "Trabalha no turno da manhã"
   */
  @IsOptional()
  @IsString()
  notes: string | null;

  /**
   * ID da instância de manutenção vinculada.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  maintenanceInstanceId: number | null;
}

// =================================================================
// 2. DTOs DE RESPOSTA - Com relações
// =================================================================

const WorkerRelationOnlyArgs = Prisma.validator<Prisma.WorkerDefaultArgs>()({
  include: {
    maintenanceInstance: true,
    workerContracts: true
  }
});

type WorkerRelationsOnly = Prisma.WorkerGetPayload<
  typeof WorkerRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa de Worker, incluindo relações.
 */
export class WorkerWithRelationsResponseDto
  extends WorkerBaseDto
  implements Partial<WorkerRelationsOnly>
{
  /**
   * Instância de manutenção vinculada.
   */
  @IsOptional()
  @Type(() => UpdateMaintenanceInstance)
  maintenanceInstance?: WorkerRelationsOnly['maintenanceInstance'];

  /**
   * Contratos do trabalhador.
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkerContractDto)
  workerContracts?: WorkerRelationsOnly['workerContracts'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO
// =================================================================

export class CreateWorkerDto extends IntersectionType(
  PartialType(WorkerBaseDto),
  PickType(WorkerBaseDto, ['name'] as const)
) {}

export class CreateWorkerWithRelationsDto extends CreateWorkerDto {
  /**
   * Instância de manutenção vinculada.
   */
  @IsOptional()
  @Type(() => UpdateMaintenanceInstance)
  maintenanceInstance?: WorkerRelationsOnly['maintenanceInstance'];

  /**
   * Contratos do trabalhador.
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkerContractDto)
  workerContracts?: CreateWorkerContractDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO
// =================================================================

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}

export class UpdateWorkerWithRelationsDto extends PartialType(
  CreateWorkerWithRelationsDto
) {}

// =================================================================
// DTOs AUXILIARES PARA RELAÇÕES
// =================================================================

/**
 * DTO base para WorkerContract
 */
class WorkerContractBaseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  workerId: number;

  @IsNumber()
  contractId: number;

  @IsNumber()
  workerSpecialtyId: number;

  @IsNumber()
  sipacUnitLocationId: number;

  @IsDate()
  start: Date;

  @IsOptional()
  @IsDate()
  end?: Date | null;

  @IsOptional()
  @IsString()
  located?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class WorkerContractDto extends WorkerContractBaseDto {}
export class CreateWorkerContractDto extends PartialType(
  WorkerContractBaseDto
) {}
export class UpdateWorkerContractDto extends PartialType(
  WorkerContractBaseDto
) {}
