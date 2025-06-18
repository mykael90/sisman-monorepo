import { SipacRequisicaoMaterial } from '@sisman/prisma';
import { CreateMaterialRequestDto } from '../dto/material-request.dto';

export class MaterialRequestMapper {
  static toCreateDto(item: SipacRequisicaoMaterial): CreateMaterialRequestDto {
    return {
      protocolNumber: String(item.numeroDaRequisicao),
      requestType: 'NEW_MATERIALS',
      requestDate: item.dataDeCadastro,
      warehouseId: 1, // SIPAC ALMOXARIFADO CENTRAL
      maintenanceRequestId: item.sipacRequisicaoManutencaoId,
      requestedById: item.usuarioId,
      sipacUnitRequesting: item.siglaUnidadeRequisitante,
      sipacUnitCost: item.siglaUnidadeDeCusto,
      sipacUserLoginRequest: item.usuarioLogin,
      origin: 'SIPAC',
      requestValue: item.valorDaRequisicao,
      servedValue: item.valorDoTotalAtendido
    };
  }
}
