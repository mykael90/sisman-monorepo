import { Prisma, SipacItemRequisicaoMaterial } from '@sisman/prisma';
import {
  CreateMaterialRequestDto,
  CreateMaterialRequestItemDto,
  CreateMaterialRequestWithRelationsDto
} from '../dto/material-request.dto';

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
      currentStatus: 'SIPAC_HANDLING',
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
      statusHistory: [
        {
          status: 'SIPAC_HANDLING',
          notes: JSON.stringify(item.historicoDaRequisicao, null, 2)
        }
      ]
    };
  }
}
