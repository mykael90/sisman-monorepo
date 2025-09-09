import { PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDate,
  IsDecimal,
  IsNumber,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@sisman/prisma';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';
import { UpdateSipacUnidadeDto } from '../../unidades/dto/sipac-unidade.dto';

/**
 * DTO for creating an item within a material requisition.
 * Corresponds to the `SipacItemRequisicaoMaterial` Prisma model.
 */
export class CreateSipacItemRequisicaoMaterialDto
  implements Prisma.SipacItemRequisicaoMaterialCreateManyInput
{
  /**
   * Número sequencial do item na requisição (ex: 1)
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numeroItem: number;

  /**
   * Código do material (ex: "302400029834")
   * @example '302400029834'
   */
  @IsNotEmpty()
  @IsString()
  codigo: string;

  /**
   * Quantidade solicitada (ex: 6)
   * @example 6
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantidade: DecimalJsLike;

  /**
   * Valor unitário do item (ex: 1.50)
   * @example 1.5
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valor: DecimalJsLike;

  /**
   * Valor total do item (quantidade * valor) (ex: 9.00)
   * @example 9.0
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  total: DecimalJsLike;

  /**
   * Quantidade atendida do item (ex: 6)
   * @example 6
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantidadeAtendida: DecimalJsLike;

  /**
   * Quantidade devolvida do item (ex: 0)
   * @example 0
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantidadeDevolvida: DecimalJsLike;

  /**
   * Quantidade em processo de compra (ex: 0)
   * @example 0
   */
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  quantidadeEmCompra: DecimalJsLike;

  /**
   * Valor unitário do atendimento (ex: 1.00)
   * @example 1.0
   */
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  valorAtendimento?: DecimalJsLike;

  /**
   * Valor total do atendimento (ex: 6.00)
   * @example 6.0
   */
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalAtendimento?: DecimalJsLike;

  /**
   * Status do item (ex: "ATENDIDO")
   * @example 'ATENDIDO'
   */
  @IsNotEmpty()
  @IsString()
  status: string;

  /**
   * Nome do item (apenas para verificar consistencia de nome, se não mudou no banco de dados do sipac)
   */
  @IsOptional()
  @IsString()
  denominacao?: string;
}

export class UpdateSipacItemRequisicaoMaterialDto extends PartialType(
  CreateSipacItemRequisicaoMaterialDto
) {}

/**
 * DTO for a history entry of a material requisition.
 * Corresponds to the `SipacHistoricoRequisicaoMaterial` Prisma model.
 */
export class CreateSipacHistoricoRequisicaoMaterialDto
  implements Prisma.SipacHistoricoRequisicaoMaterialCreateManyInput
{
  @IsNotEmpty()
  @IsNumber()
  requisicaoId: number;
  /**
   * Data e hora do evento (ex: "2025-04-10T13:40:00.000Z")
   * @example '2025-04-10T13:40:00.000Z'
   */
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataHora: Date;

  /**
   * Status atribuído no evento (ex: "CADASTRADA")
   * @example 'CADASTRADA'
   */
  @IsNotEmpty()
  @IsString()
  status: string;

  /**
   * Usuário responsável pelo evento (ex: "EDIVAN DO NASCIMENTO")
   * @example 'EDIVAN DO NASCIMENTO'
   */
  @IsNotEmpty()
  @IsString()
  usuario: string;

  /**
   * Observações do evento
   * @example 'Requisição inicial.'
   */
  @IsOptional()
  @IsString()
  observacoes?: string;
}

/**
 * DTO for creating a totalization by expense element for a material requisition.
 * Corresponds to the `SipacTotalizacaoElementoDespesaMaterial` Prisma model.
 */
export class CreateSipacTotalizacaoElementoDespesaMaterialDto
  implements Prisma.SipacTotalizacaoElementoDespesaMaterialCreateManyInput
{
  id?: number;
  requisicaoId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  /**
   * Descrição do grupo de material e elemento de despesa.
   * @example 'MATERIAL DE CONSUMO - 339030.01'
   */
  @IsNotEmpty()
  @IsString()
  grupoDeMaterial: string;

  /**
   * Valor total para o grupo.
   * @example 500.75
   */
  // type: 'number', format: 'double' são inferidos
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  total?: DecimalJsLike;
}

/**
 * DTO for updating a totalization by expense element.
 */
export class UpdateSipacTotalizacaoElementoDespesaMaterialDto extends PartialType(
  CreateSipacTotalizacaoElementoDespesaMaterialDto
) {
  /**
   * ID da totalização a ser atualizada.
   * @example 1
   */
  // required: false é inferido de `id?: number;`
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO for creating acquisition details for items in a material requisition.
 * Corresponds to the `SipacDetalheAquisicaoItemMaterial` Prisma model.
 */
export class CreateSipacDetalheAquisicaoItemMaterialDto
  implements Prisma.SipacDetalheAquisicaoItemMaterialCreateManyInput
{
  /**
   * ID da Requisição de Material à qual este detalhe pertence.
   * @example 12345
   */
  @IsNotEmpty()
  @IsNumber()
  requisicaoId: number;

  /**
   * Informações sobre processos de compra.
   * @example 'Processo SEI 123/2025'
   */
  @IsOptional()
  @IsString()
  compras?: string;

  /**
   * Informações sobre empenhos.
   * @example 'NE 2025NE000123'
   */
  @IsOptional()
  @IsString()
  empenhos?: string;

  /**
   * Informações sobre notas fiscais.
   * @example 'NF-e 98765'
   */
  @IsOptional()
  @IsString()
  notasFiscais?: string;

  /**
   * Informações sobre processos de pagamento.
   * @example 'Pagamento via OB 2025OB00456'
   */
  @IsOptional()
  @IsString()
  processosDePagamento?: string;
}

/**
 * DTO for updating acquisition details.
 */
export class UpdateSipacDetalheAquisicaoItemMaterialDto extends PartialType(
  CreateSipacDetalheAquisicaoItemMaterialDto
) {
  /**
   * ID do detalhe de aquisição a ser atualizado.
   * @example 1
   */
  // required: false é inferido de `id?: number;`
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO for creating multiple SipacRequisicaoMaterial records.
 * Note: The `id` field is included here because the Prisma schema `id Int @id` (without `@default(autoincrement())`)
 * implies that the ID must be provided on creation, likely originating from an external system (SIPAC).
 */
export class CreateSipacListaRequisicaoMaterialDto
  implements Prisma.SipacRequisicaoMaterialCreateManyInput
{
  /**
   * Identificador único da requisição (deve ser fornecido se não for autogerado)
   * @example 12345
   */
  @IsNotEmpty()
  @IsNumber()
  id: number; // ID from SIPAC, not auto-generated by local DB in this context

  /**
   * Data de cadastro da requisição
   * @example '2025-04-10T00:00:00.000Z'
   */
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataDeCadastro: Date;

  /**
   * Número da requisição no SIPAC
   * @example '10990/2025'
   */
  @IsNotEmpty()
  @IsString()
  numeroDaRequisicao: string;

  /**
   * Unidade requisitante
   * @example 'DIRETORIA XYZ'
   */
  @IsNotEmpty()
  @IsString()
  siglaUnidadeRequisitante: string;

  /**
   * Unidade de custo
   * @example 'CENTRO DE CUSTO ABC'
   */
  @IsNotEmpty()
  @IsString()
  siglaUnidadeDeCusto: string;

  /**
   * Grupo de material
   * @example '(0) Material Geral'
   */
  @IsOptional()
  @IsString()
  grupoDeMaterial?: string;

  /**
   * Tipo da requisição
   * @example 'REQUISIÇÃO DE MATERIAL PADRÃO'
   */
  @IsNotEmpty()
  @IsString()
  tipoDaRequisicao: string;

  /**
   * Almoxarifado de destino
   * @example 'ALMOXARIFADO CENTRAL'
   */
  @IsNotEmpty()
  @IsString()
  almoxarifado: string;

  /**
   * Status atual da requisição
   * @example 'CADASTRADA'
   */
  @IsNotEmpty()
  @IsString()
  statusAtual: string;

  /**
   * Login do usuário que cadastrou
   * @example 'usuario.login'
   */
  @IsNotEmpty()
  @IsString()
  usuarioLogin: string;

  /**
   * Valor total da requisição
   * @example 150.75
   */
  // type: 'number', format: 'double' são inferidos
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valorDaRequisicao: DecimalJsLike; // Prisma Decimal type

  @IsOptional()
  @IsNumber()
  grupoMaterialId?: number;
}

/**
 * Base DTO for creating a SipacRequisicaoMaterial with all its fields and relations.
 * This DTO reflects the comprehensive structure from the example JSON and Prisma schema.
 */
export class CreateSipacRequisicaoMaterialCompletoDto extends CreateSipacListaRequisicaoMaterialDto {
  /**
   * Tipo da requisição (ex: "REQUISIÇÃO DE MATERIAL")
   * @example 'REQUISIÇÃO DE MATERIAL'
   */
  // required: false é inferido de `tipoDaRequisicao: string;` (não é opcional)
  @IsNotEmpty()
  @IsString()
  tipoDaRequisicao: string;

  /**
   * Indica se há convênio (ex: "Não")
   * @example 'Não'
   */
  @IsOptional()
  @IsString()
  convenio?: string;

  /**
   * Grupo de material (ex: "(0)")
   * @example '(0)'
   */
  @IsOptional()
  @IsString()
  grupoDeMaterial?: string;

  /**
   * Unidade de custo (ex: "INSTITUTO METROPOLE DIGITAL (11.00.05)")
   * @example 'INSTITUTO METROPOLE DIGITAL (11.00.05)'
   */
  @IsNotEmpty()
  @IsString()
  siglaUnidadeDeCusto: string;

  /**
   * Unidade requisitante (ex: "DIRETORIA DE MANUTENÇÃO DE INSTALAÇÕES FÍSICAS (11.08.05)")
   * @example 'DIRETORIA DE MANUTENÇÃO DE INSTALAÇÕES FÍSICAS (11.08.05)'
   */
  @IsNotEmpty()
  @IsString()
  siglaUnidadeRequisitante: string;

  /**
   * Destino da requisição
   * @example 'SUSTENTAÇÃO DE ESTOQUE DO ALMOXARIFADO DA SUP. INFRAESTRUTURA (11.89)'
   */
  @IsOptional()
  @IsString()
  destinoDaRequisicao?: string;

  /**
   * Login do usuário que cadastrou a requisição (ex: "edivan.nascimento")
   * @example 'edivan.nascimento'
   */
  @IsNotEmpty()
  @IsString()
  usuarioLogin: string;

  /**
   * Data de cadastro da requisição (ex: "2025-04-10T00:00:00.000Z")
   * @example '2025-04-10T00:00:00.000Z'
   */
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataDeCadastro: Date;

  /**
   * Data de envio da requisição
   * @example '2025-04-10T00:00:00.000Z'
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataDeEnvio?: Date;

  /**
   * Valor total da requisição (ex: 9.00)
   * @example 9.0
   */
  // type: 'number', format: 'double' são inferidos
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valorDaRequisicao: DecimalJsLike;

  /**
   * Valor total atendido da requisição (ex: 6.00)
   * @example 6.0
   */
  // type: 'number', format: 'double' são inferidos
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  valorDoTotalAtendido?: DecimalJsLike;

  /**
   * Opção orçamentária
   * @example 'SOLICITAR AUTORIZAÇÃO ORÇAMENTÁRIA'
   */
  @IsOptional()
  @IsString()
  opcaoOrcamentaria?: string;

  /**
   * Número da requisição relacionada
   * @example '1164/ 2025 (REQUISIÇÃO DE MANUTENÇÃO)'
   */
  @IsOptional()
  @IsString()
  numeroDaRequisicaoRelacionada?: string;

  /**
   * Local da requisição
   * @example 'INSTITUTO METROPOLE DIGITAL - CIVT'
   */
  @IsOptional()
  @IsString()
  local?: string;

  /**
   * Observações gerais da requisição
   * @example 'Material urgente.'
   */
  @IsOptional()
  @IsString()
  observacoes?: string;

  /**
   * Status atual da requisição (ex: "FINALIZADA")
   * @example 'FINALIZADA'
   */
  @IsNotEmpty()
  @IsString()
  statusAtual: string;

  /**
   * Identificação do almoxarifado (ex: "ALMOXARIFADO CENTRAL")
   * @example 'ALMOXARIFADO CENTRAL'
   */
  @IsNotEmpty()
  @IsString()
  almoxarifado: string;

  /**
   * Lista de itens da requisição
   */
  // type: () => [CreateSipacItemRequisicaoMaterialDto] e required: false são inferidos
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacItemRequisicaoMaterialDto)
  itensDaRequisicao?: CreateSipacItemRequisicaoMaterialDto[];

  /**
   * Histórico de alterações da requisição
   */
  // type: () => [CreateSipacHistoricoRequisicaoMaterialDto] e required: false são inferidos
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacHistoricoRequisicaoMaterialDto)
  historicoDaRequisicao?: CreateSipacHistoricoRequisicaoMaterialDto[];

  /**
   * Lista de totalizações por elemento de despesa da requisição
   */
  // type: () => [CreateSipacTotalizacaoElementoDespesaMaterialDto] e required: false são inferidos
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacTotalizacaoElementoDespesaMaterialDto)
  totalizacaoPorElementoDeDespesasDetalhados?: CreateSipacTotalizacaoElementoDespesaMaterialDto[];

  /**
   * Detalhes da aquisição dos itens da requisição
   */
  // type: () => [CreateSipacDetalheAquisicaoItemMaterialDto] e required: false são inferidos
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacDetalheAquisicaoItemMaterialDto)
  detalhesDaAquisicao?: CreateSipacDetalheAquisicaoItemMaterialDto[];

  /**
    description: 'Unidade requisitante associada'
   */
  // type: () => [UpdateSipacUnidadeDto] é inferido
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  unidadeRequisitante?: UpdateSipacUnidadeDto;

  /**
    description: 'Unidade de custo associada'
   */
  // type: () => [UpdateSipacUnidadeDto] é inferido
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  unidadeCusto?: UpdateSipacUnidadeDto;

  @IsOptional()
  @IsNumber()
  grupoMaterialId?: number;
}

export class CreateManySipacListaRequisicaoMaterialDto {
  /**
   * Lista de requisições de material.
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacListaRequisicaoMaterialDto)
  items: CreateSipacListaRequisicaoMaterialDto[];
}

/**
 * DTO for updating an existing SipacRequisicaoMaterial.
 * All fields are optional, allowing for partial updates.
 * The `id` to identify the record should typically be passed as a URL parameter (e.g., /requisicoes/:id)
 * or, if included in the body, it's often optional here as well.
 * Following the pattern in user.dto.ts, id is optional in the body.
 */
export class UpdateSipacRequisicaoMaterialDto extends PartialType(
  CreateSipacRequisicaoMaterialCompletoDto
) {}
