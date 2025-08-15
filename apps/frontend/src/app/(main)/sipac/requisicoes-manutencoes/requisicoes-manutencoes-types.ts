import { Prisma, SipacRequisicaoManutencao } from '@sisman/prisma';

export interface ISipacRequisicaoManutencao extends SipacRequisicaoManutencao {}

export interface ISipacRequisicaoManutencaoRelationsOnly
  extends Prisma.SipacRequisicaoManutencaoGetPayload<{
    select: {
      informacoesServico: true;
      requisicaoManutencaoMae: true;
      requisicoesManutencaoFilhas: true;
      requisicoesMateriais: true;
      predios: true;
      historico: true;
      unidadeRequisitante: true;
      unidadeCusto: true;
    };
  }> {}

export type ISipacRequisicaoManutencaoWithRelations =
  ISipacRequisicaoManutencao & Partial<ISipacRequisicaoManutencaoRelationsOnly>;
