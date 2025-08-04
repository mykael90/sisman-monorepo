import {
  Prisma,
  MaintenanceRequestOrigin,
  SipacRequisicaoMaterial,
  MaintenanceRequestStatusOptions
} from '@sisman/prisma';
import { getNowFormatted } from '../../../shared/utils/date-utils';
import { CreateMaintenanceRequestWithRelationsDto } from '../dto/maintenance-request.dto';
import { UpdateMaterialRequestWithRelationsDto } from '../../material-requests/dto/material-request.dto';

export class MaintenanceRequestMapper {
  static toCreateDto(
    item: Prisma.SipacRequisicaoManutencaoGetPayload<{
      include: {
        predios: true;
        requisicoesMateriais: true;
        unidadeCusto: true;
        unidadeRequisitante: true;
        historico: true;
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
      requestedAt: item.dataDeCadastro,
      local: item.local,
      completedAt:
        item.status === 'FINALIZADA'
          ? item.historico[item.historico.length - 1].data
          : undefined,

      // relations
      building:
        item.predios.length > 0
          ? {
              id: item.predios[0].subRip
            }
          : undefined, //id que vem do predioSipac
      materialRequests: item.requisicoesMateriais?.map(
        (
          requisicaoMaterial: SipacRequisicaoMaterial
        ): UpdateMaterialRequestWithRelationsDto => ({
          protocolNumber: requisicaoMaterial.numeroDaRequisicao
        })
      ),

      statuses: {
        status: MaintenanceRequestStatusOptions.SIPAC_MANAGEMENT,
        description: `Requisição ${item.numeroRequisicao} gerenciada pelo SIPAC. Importada em ${getNowFormatted()}.`
      }
    };
  }
}
