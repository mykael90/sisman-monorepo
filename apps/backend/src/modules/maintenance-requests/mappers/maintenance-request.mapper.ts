import {
  Prisma,
  MaintenanceRequestOrigin,
  SipacRequisicaoMaterial
} from '@sisman/prisma';
import { getNowFormatted } from '../../../shared/utils/date-utils';
import { CreateMaintenanceRequestWithRelationsDto } from '../dto/maintenance-request.dto';
import { UpdateMaterialRequestWithRelationsDto } from '../../material-requests/dto/material-request.dto';

// type SipacStatus =
//   | 'CADASTRADA'
//   | 'AGUARD. AUTORIZAÇÃO ORÇAMENTÁRIA'
//   | 'AUTORIZADA'
//   | 'ENVIADA'
//   | 'ESTORNADA'
//   | 'MUDANÇA DE UNID. DE CUSTO'
//   | 'FINALIZADA ATENDIMENTO'
//   | 'FINALIZADA';

// type SismanStatus =
//   (typeof MaterialRequestStatusOptions)[keyof typeof MaterialRequestStatusOptions];

// const StatusSipacToSisman: Record<SipacStatus, SismanStatus> = {
//   CADASTRADA: MaterialRequestStatusOptions.REGISTERED,
//   'AGUARD. AUTORIZAÇÃO ORÇAMENTÁRIA': MaterialRequestStatusOptions.PENDING,
//   AUTORIZADA: MaterialRequestStatusOptions.APPROVED,
//   ENVIADA: MaterialRequestStatusOptions.FORWARDED,
//   ESTORNADA: MaterialRequestStatusOptions.REVERSED,
//   'MUDANÇA DE UNID. DE CUSTO': MaterialRequestStatusOptions.CHANGE_SPONSOR,
//   'FINALIZADA ATENDIMENTO': MaterialRequestStatusOptions.PARTIALLY_ATTENDED,
//   FINALIZADA: MaterialRequestStatusOptions.FULLY_ATTENDED
// };

export class MaintenanceRequestMapper {
  static toCreateDto(
    item: Prisma.SipacRequisicaoManutencaoGetPayload<{
      include: {
        predios: true;
        requisicoesMateriais: true;
        unidadeCusto: true;
        unidadeRequisitante: true;
      };
    }>
  ): CreateMaintenanceRequestWithRelationsDto {
    return {
      protocolNumber: String(item.numeroRequisicao),
      title: item.tipoDaRequisicao,
      description: item.descricao,
      sipacUnitRequesting: item.unidadeRequisitante,
      sipacUnitCost: item.unidadeCusto,
      sipacUserLoginRequest: item.usuarioGravacao,
      origin: MaintenanceRequestOrigin.SIPAC,

      // relations
      building: {
        id: item.predios[0].subRip //id que vem do predioSipac
      },
      materialRequests: item.requisicoesMateriais?.map(
        (
          requisicaoMaterial: SipacRequisicaoMaterial
        ): UpdateMaterialRequestWithRelationsDto => ({
          protocolNumber: requisicaoMaterial.numeroDaRequisicao
        })
      )
    };
  }
}
