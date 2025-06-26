import {
  Prisma,
  SipacItemRequisicaoMaterial,
  MaterialRequestStatusOptions
} from '@sisman/prisma';
import {
  CreateMaterialRequestDto,
  CreateMaterialRequestItemDto,
  CreateMaterialRequestWithRelationsDto
} from '../dto/material-request.dto';
import { nowFormatted } from '../../../shared/utils/date-utils';

type SipacStatus =
  | 'CADASTRADA'
  | 'AGUARD. AUTORIZAÇÃO ORÇAMENTÁRIA'
  | 'AUTORIZADA'
  | 'ENVIADA'
  | 'ESTORNADA'
  | 'MUDANÇA DE UNID. DE CUSTO'
  | 'FINALIZADA ATENDIMENTO'
  | 'FINALIZADA';

type SismanStatus =
  (typeof MaterialRequestStatusOptions)[keyof typeof MaterialRequestStatusOptions];

const StatusSipacToSisman: Record<SipacStatus, SismanStatus> = {
  CADASTRADA: MaterialRequestStatusOptions.REGISTERED,
  'AGUARD. AUTORIZAÇÃO ORÇAMENTÁRIA': MaterialRequestStatusOptions.PENDING,
  AUTORIZADA: MaterialRequestStatusOptions.APPROVED,
  ENVIADA: MaterialRequestStatusOptions.FORWARDED,
  ESTORNADA: MaterialRequestStatusOptions.REVERSED,
  'MUDANÇA DE UNID. DE CUSTO': MaterialRequestStatusOptions.CHANGE_SPONSOR,
  'FINALIZADA ATENDIMENTO': MaterialRequestStatusOptions.PARTIALLY_ATTENDED,
  FINALIZADA: MaterialRequestStatusOptions.FULLY_ATTENDED
};

export class MaterialRequestMapper {
  static toCreateDto(
    item: Prisma.SipacRequisicaoMaterialGetPayload<{
      include: {
        itensDaRequisicao: true;
        unidadeCusto: true;
        unidadeRequisitante: true;
        historicoDaRequisicao: true;
      };
    }>
  ): CreateMaterialRequestWithRelationsDto {
    return {
      protocolNumber: String(item.numeroDaRequisicao),
      requestType: 'NEW_MATERIALS',
      requestDate: item.dataDeCadastro,
      maintenanceRequestId: item.sipacRequisicaoManutencaoId || undefined,
      requestedById: item.usuarioId || undefined,
      sipacUnitRequesting: item.unidadeRequisitante,
      sipacUnitCost: item.unidadeCusto,
      sipacUserLoginRequest: item.usuarioLogin,
      origin: 'SIPAC',
      requestValue: item.valorDaRequisicao,
      servedValue: item.valorDoTotalAtendido,
      purpose: 'SUPPLY_MAINTENANCE',
      currentStatus: StatusSipacToSisman[item.statusAtual],
      notes: `IMPORTADO DO SIPAC EM ${nowFormatted} \n ${item.observacoes}`,

      // relations
      storage: {
        id: 1 //almoxarifado central da ufrn id=1 (convenção minha)
      },
      items: item.itensDaRequisicao?.map(
        (
          material: SipacItemRequisicaoMaterial
        ): CreateMaterialRequestItemDto => ({
          requestedGlobalMaterialId: material.codigo,
          quantityRequested: material.quantidade,
          quantityApproved: material.quantidadeAtendida,
          quantityDelivered: material.quantidadeAtendida
        })
      ),
      statusHistory: item.historicoDaRequisicao.map((status) => ({
        status: StatusSipacToSisman[status.status],
        changeDate: status.dataHora,
        notes: `IMPORTADO DO SIPAC EM ${nowFormatted}`
        // notes: JSON.stringify(status, null, 2)
      }))
      // [
      //   {
      //     status: StatusSipacToSisman[item.historicoDaRequisicao[0].status],
      //     notes: JSON.stringify(item.historicoDaRequisicao, null, 2)
      //   }
      // ]
    };
  }
}
