import { SipacUnidade, Prisma } from '@sisman/prisma';

export type ISipacUnidadeWithRelations = Prisma.SipacUnidadeGetPayload<{
  include: {
    requisicoesManutencaoRequisistante: true;
    requisicoesManutencaoCusto: true;
    requisicoesMaterialRequisitante: true;
    requisicoesMaterialCusto: true;
    maintenanceRequestRequisitante: true;
    maintenanceRequestCusto: true;
    materialRequestRequisitante: true;
    materialRequestCusto: true;
    infrastructureBuilding: true;
    workersContractsLocation: true;
  };
}>;

export interface ISipacUnidadeAdd extends Prisma.SipacUnidadeCreateManyInput {}

export interface ISipacUnidadeEdit extends ISipacUnidadeAdd {
  id: number;
}

export type ISipacUnidade = SipacUnidade;

export type ISipacUnidadeRemove = {
  id: string;
};

export type ISipacUnidadeSelect = Prisma.SipacUnidadeSelect;
