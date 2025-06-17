import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Número sequencial do item na requisição (ex: 1)',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numeroItem: number;

  @ApiProperty({
    description: 'Código do material (ex: "302400029834")',
    example: '302400029834'
  })
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @ApiProperty({ description: 'Quantidade solicitada (ex: 6)', example: 6 })
  @IsNotEmpty()
  @IsNumber()
  quantidade: number;

  @ApiProperty({
    description: 'Valor unitário do item (ex: 1.50)',
    type: 'number',
    format: 'double',
    example: 1.5
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valor: DecimalJsLike;

  @ApiProperty({
    description: 'Valor total do item (quantidade * valor) (ex: 9.00)',
    type: 'number',
    format: 'double',
    example: 9.0
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  total: DecimalJsLike;

  @ApiProperty({
    description: 'Quantidade atendida do item (ex: 6)',
    example: 6
  })
  @IsNotEmpty()
  @IsNumber()
  quantidadeAtendida: number;

  @ApiProperty({
    description: 'Quantidade devolvida do item (ex: 0)',
    example: 0
  })
  @IsNotEmpty()
  @IsNumber()
  quantidadeDevolvida: number;

  @ApiProperty({
    description: 'Quantidade em processo de compra (ex: 0)',
    example: 0
  })
  @IsNotEmpty()
  @IsNumber()
  quantidadeEmCompra: number;

  @ApiProperty({
    description: 'Valor unitário do atendimento (ex: 1.00)',
    type: 'number',
    format: 'double',
    required: false,
    example: 1.0
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  valorAtendimento?: DecimalJsLike;

  @ApiProperty({
    description: 'Valor total do atendimento (ex: 6.00)',
    type: 'number',
    format: 'double',
    required: false,
    example: 6.0
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalAtendimento?: DecimalJsLike;

  @ApiProperty({
    description: 'Status do item (ex: "ATENDIDO")',
    example: 'ATENDIDO'
  })
  @IsNotEmpty()
  @IsString()
  status: string;
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

  @ApiProperty({
    description: 'Data e hora do evento (ex: "2025-04-10T13:40:00.000Z")',
    example: '2025-04-10T13:40:00.000Z'
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataHora: Date;

  @ApiProperty({
    description: 'Status atribuído no evento (ex: "CADASTRADA")',
    example: 'CADASTRADA'
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Usuário responsável pelo evento (ex: "EDIVAN DO NASCIMENTO")',
    example: 'EDIVAN DO NASCIMENTO'
  })
  @IsNotEmpty()
  @IsString()
  usuario: string;

  @ApiProperty({
    description: 'Observações do evento',
    required: false,
    example: 'Requisição inicial.'
  })
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
  @ApiProperty({
    description: 'Descrição do grupo de material e elemento de despesa.',
    example: 'MATERIAL DE CONSUMO - 339030.01'
  })
  @IsNotEmpty()
  @IsString()
  grupoDeMaterial: string;

  @ApiProperty({
    description: 'Valor total para o grupo.',
    type: 'number',
    format: 'double',
    example: 500.75
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  total: DecimalJsLike;
}

/**
 * DTO for updating a totalization by expense element.
 */
export class UpdateSipacTotalizacaoElementoDespesaMaterialDto extends PartialType(
  CreateSipacTotalizacaoElementoDespesaMaterialDto
) {
  @ApiProperty({
    description: 'ID da totalização a ser atualizada.',
    required: false,
    example: 1
  })
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
  @ApiProperty({
    description: 'ID da Requisição de Material à qual este detalhe pertence.',
    example: 12345
  })
  @IsNotEmpty()
  @IsNumber()
  requisicaoId: number;

  @ApiProperty({
    description: 'Informações sobre processos de compra.',
    required: false,
    example: 'Processo SEI 123/2025'
  })
  @IsOptional()
  @IsString()
  compras?: string;

  @ApiProperty({
    description: 'Informações sobre empenhos.',
    required: false,
    example: 'NE 2025NE000123'
  })
  @IsOptional()
  @IsString()
  empenhos?: string;

  @ApiProperty({
    description: 'Informações sobre notas fiscais.',
    required: false,
    example: 'NF-e 98765'
  })
  @IsOptional()
  @IsString()
  notasFiscais?: string;

  @ApiProperty({
    description: 'Informações sobre processos de pagamento.',
    required: false,
    example: 'Pagamento via OB 2025OB00456'
  })
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
  @ApiProperty({
    description: 'ID do detalhe de aquisição a ser atualizado.',
    required: false,
    example: 1
  })
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
  @ApiProperty({
    description:
      'Identificador único da requisição (deve ser fornecido se não for autogerado)',
    example: 12345
  })
  @IsNotEmpty()
  @IsNumber()
  id: number; // ID from SIPAC, not auto-generated by local DB in this context

  @ApiProperty({
    description: 'Data de cadastro da requisição',
    example: '2025-04-10T00:00:00.000Z'
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataDeCadastro: Date;

  @ApiProperty({
    description: 'Número da requisição no SIPAC',
    example: '10990/2025'
  })
  @IsNotEmpty()
  @IsString()
  numeroDaRequisicao: string;

  @ApiProperty({
    description: 'Unidade requisitante',
    example: 'DIRETORIA XYZ'
  })
  @IsNotEmpty()
  @IsString()
  siglaUnidadeRequisitante: string;

  @ApiProperty({
    description: 'Unidade de custo',
    example: 'CENTRO DE CUSTO ABC'
  })
  @IsNotEmpty()
  @IsString()
  siglaUnidadeDeCusto: string;

  @ApiProperty({
    description: 'Grupo de material',
    required: false,
    example: '(0) Material Geral'
  })
  @IsOptional()
  @IsString()
  grupoDeMaterial?: string;

  @ApiProperty({
    description: 'Tipo da requisição',
    example: 'REQUISIÇÃO DE MATERIAL PADRÃO'
  })
  @IsNotEmpty()
  @IsString()
  tipoDaRequisicao: string;

  @ApiProperty({
    description: 'Almoxarifado de destino',
    example: 'ALMOXARIFADO CENTRAL'
  })
  @IsNotEmpty()
  @IsString()
  almoxarifado: string;

  @ApiProperty({
    description: 'Status atual da requisição',
    example: 'CADASTRADA'
  })
  @IsNotEmpty()
  @IsString()
  statusAtual: string;

  @ApiProperty({
    description: 'Login do usuário que cadastrou',
    example: 'usuario.login'
  })
  @IsNotEmpty()
  @IsString()
  usuarioLogin: string;

  @ApiProperty({
    description: 'Valor total da requisição',
    type: 'number',
    format: 'double',
    example: 150.75
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valorDaRequisicao: DecimalJsLike; // Prisma Decimal type
}

/**
 * Base DTO for creating a SipacRequisicaoMaterial with all its fields and relations.
 * This DTO reflects the comprehensive structure from the example JSON and Prisma schema.
 */
export class CreateSipacRequisicaoMaterialCompletoDto extends CreateSipacListaRequisicaoMaterialDto {
  @ApiProperty({
    description: 'Número da requisição no SIPAC (ex: "10990/2025")',
    example: '10990/2025'
  })
  @IsNotEmpty()
  @IsString()
  numeroDaRequisicao: string;

  @ApiProperty({
    description: 'Tipo da requisição (ex: "REQUISIÇÃO DE MATERIAL")',
    required: false,
    example: 'REQUISIÇÃO DE MATERIAL'
  })
  @IsNotEmpty()
  @IsString()
  tipoDaRequisicao: string;

  @ApiProperty({
    description: 'Indica se há convênio (ex: "Não")',
    required: false,
    example: 'Não'
  })
  @IsOptional()
  @IsString()
  convenio?: string;

  @ApiProperty({
    description: 'Grupo de material (ex: "(0)")',
    required: false,
    example: '(0)'
  })
  @IsOptional()
  @IsString()
  grupoDeMaterial?: string;

  @ApiProperty({
    description:
      'Unidade de custo (ex: "INSTITUTO METROPOLE DIGITAL (11.00.05)")',
    example: 'INSTITUTO METROPOLE DIGITAL (11.00.05)'
  })
  @IsNotEmpty()
  @IsString()
  siglaUnidadeDeCusto: string;

  @ApiProperty({
    description:
      'Unidade requisitante (ex: "DIRETORIA DE MANUTENÇÃO DE INSTALAÇÕES FÍSICAS (11.08.05)")',
    example: 'DIRETORIA DE MANUTENÇÃO DE INSTALAÇÕES FÍSICAS (11.08.05)'
  })
  @IsNotEmpty()
  @IsString()
  siglaUnidadeRequisitante: string;

  @ApiProperty({
    description: 'Destino da requisição',
    required: false,
    example:
      'SUSTENTAÇÃO DE ESTOQUE DO ALMOXARIFADO DA SUP. INFRAESTRUTURA (11.89)'
  })
  @IsOptional()
  @IsString()
  destinoDaRequisicao?: string;

  @ApiProperty({
    description:
      'Login do usuário que cadastrou a requisição (ex: "edivan.nascimento")',
    example: 'edivan.nascimento'
  })
  @IsNotEmpty()
  @IsString()
  usuarioLogin: string;

  @ApiProperty({
    description:
      'Data de cadastro da requisição (ex: "2025-04-10T00:00:00.000Z")',
    example: '2025-04-10T00:00:00.000Z'
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dataDeCadastro: Date;

  @ApiProperty({
    description: 'Data de envio da requisição',
    required: false,
    example: '2025-04-10T00:00:00.000Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataDeEnvio?: Date;

  @ApiProperty({
    description: 'Valor total da requisição (ex: 9.00)',
    type: 'number',
    format: 'double',
    example: 9.0
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2' })
  valorDaRequisicao: DecimalJsLike;

  @ApiProperty({
    description: 'Valor total atendido da requisição (ex: 6.00)',
    type: 'number',
    format: 'double',
    required: false,
    example: 6.0
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  valorDoTotalAtendido?: DecimalJsLike;

  @ApiProperty({
    description: 'Opção orçamentária',
    required: false,
    example: 'SOLICITAR AUTORIZAÇÃO ORÇAMENTÁRIA'
  })
  @IsOptional()
  @IsString()
  opcaoOrcamentaria?: string;

  @ApiProperty({
    description: 'Número da requisição relacionada',
    required: false,
    example: '1164/ 2025 (REQUISIÇÃO DE MANUTENÇÃO)'
  })
  @IsOptional()
  @IsString()
  numeroDaRequisicaoRelacionada?: string;

  @ApiProperty({
    description: 'Local da requisição',
    required: false,
    example: 'INSTITUTO METROPOLE DIGITAL - CIVT'
  })
  @IsOptional()
  @IsString()
  local?: string;

  @ApiProperty({
    description: 'Observações gerais da requisição',
    required: false,
    example: 'Material urgente.'
  })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({
    description: 'Status atual da requisição (ex: "FINALIZADA")',
    example: 'FINALIZADA'
  })
  @IsNotEmpty()
  @IsString()
  statusAtual: string;

  @ApiProperty({
    description: 'Identificação do almoxarifado (ex: "ALMOXARIFADO CENTRAL")',
    example: 'ALMOXARIFADO CENTRAL'
  })
  @IsNotEmpty()
  @IsString()
  almoxarifado: string;

  @ApiProperty({
    type: () => [CreateSipacItemRequisicaoMaterialDto],
    required: false,
    description: 'Lista de itens da requisição'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacItemRequisicaoMaterialDto)
  itensDaRequisicao?: CreateSipacItemRequisicaoMaterialDto[];

  @ApiProperty({
    type: () => [CreateSipacHistoricoRequisicaoMaterialDto],
    required: false,
    description: 'Histórico de alterações da requisição'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacHistoricoRequisicaoMaterialDto)
  historicoDaRequisicao?: CreateSipacHistoricoRequisicaoMaterialDto[];

  @ApiProperty({
    type: () => [CreateSipacTotalizacaoElementoDespesaMaterialDto],
    required: false,
    description: 'Lista de totalizações por elemento de despesa da requisição'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacTotalizacaoElementoDespesaMaterialDto)
  totalizacaoPorElementoDeDespesasDetalhados?: CreateSipacTotalizacaoElementoDespesaMaterialDto[];

  @ApiProperty({
    type: () => [CreateSipacDetalheAquisicaoItemMaterialDto],
    required: false,
    description: 'Detalhes da aquisição dos itens da requisição'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSipacDetalheAquisicaoItemMaterialDto)
  detalhesDaAquisicao?: CreateSipacDetalheAquisicaoItemMaterialDto[];

  @ApiProperty({
    type: () => [UpdateSipacUnidadeDto],
    description: 'Unidade requisitante associada'
  })
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  unidadeRequisitante?: UpdateSipacUnidadeDto;

  @ApiProperty({
    type: () => [UpdateSipacUnidadeDto],
    description: 'Unidade de custo associada'
  })
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  unidadeCusto?: UpdateSipacUnidadeDto;
}

export class CreateManySipacListaRequisicaoMaterialDto {
  @ApiProperty({ type: () => [CreateSipacListaRequisicaoMaterialDto] })
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
