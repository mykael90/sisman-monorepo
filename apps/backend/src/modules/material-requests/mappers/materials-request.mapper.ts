import {
  Prisma,
  SipacItemRequisicaoMaterial,
  MaterialRequestStatusOptions,
  MaterialRequestType,
  MaterialRequestOrigin,
  MaterialRequestPurpose,
  MaterialRequestItemType
} from '@sisman/prisma';
import {
  CreateMaterialRequestItemDto,
  CreateMaterialRequestWithRelationsDto
} from '../dto/material-request.dto';
import { getNowFormatted } from '../../../shared/utils/date-utils';

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
      requestType: MaterialRequestType.NEW_MATERIALS,
      requestDate: item.dataDeCadastro,
      maintenanceRequestId: item.sipacRequisicaoManutencaoId || undefined,
      requestedById: item.usuarioId || undefined,
      sipacUnitRequesting: item.unidadeRequisitante,
      sipacUnitCost: item.unidadeCusto,
      sipacUserLoginRequest: item.usuarioLogin,
      origin: MaterialRequestOrigin.SIPAC,
      requestValue: item.valorDaRequisicao,
      servedValue: item.valorDoTotalAtendido,
      purpose: MaterialRequestPurpose.SUPPLY_MAINTENANCE,
      currentStatus: StatusSipacToSisman[item.statusAtual],
      notes: `IMPORTADO DO ${MaterialRequestOrigin.SIPAC} EM ${getNowFormatted()} \n ${item.observacoes}`,

      // relations
      storage: {
        id: 1 //almoxarifado central da ufrn id=1 (convenção minha)
      },
      items: item.itensDaRequisicao?.map(
        (
          material: SipacItemRequisicaoMaterial
        ): CreateMaterialRequestItemDto => ({
          itemRequestType: MaterialRequestItemType.GLOBAL_CATALOG,
          requestedGlobalMaterialId: material.codigo,
          quantityRequested: material.quantidade,
          quantityApproved: material.quantidadeAtendida,
          quantityDelivered: material.quantidadeAtendida,
          unitPrice: material.valor
        })
      ),
      statusHistory: item.historicoDaRequisicao.map((status) => ({
        status: StatusSipacToSisman[status.status],
        changeDate: status.dataHora,
        notes: `IMPORTADO ${MaterialRequestOrigin.SIPAC} EM ${getNowFormatted()}`
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
