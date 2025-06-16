import { SipacRequisicaoMaterial } from '@sisman/prisma';
import { CreateMaterialRequestDto } from '../dto/material-request.dto';

export class MaterialRequestMapper {
  static toCreateDto(item: SipacRequisicaoMaterial): CreateMaterialRequestDto {
    return {
      protocolNumber: String(item.id),
      requestType: 'NEW_MATERIALS',
      requestDate: item.dataDeCadastro,
      warehouseId: 1, // SIPAC ALMOXARIFADO CENTRAL
      maintenanceRequestId: item.sipacRequisicaoManutencaoId,
      requestedById: item.usuarioId,
      sipacUnitRequesting: item.unidadeRequisitante,
      sipacUnitCost: item.unidadeDeCusto,
      origin: 'SIPAC',
      requestValue: item.valorDaRequisicao,
      servedValue: item.valorDoTotalAtendido
    };
  }
}
