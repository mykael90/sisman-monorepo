import { notFound } from 'next/navigation';
import {
  showMaintenanceRequest,
  showMaintenanceRequestBalanceById
} from '@/app/(main)/maintenance/request/maintenance-request-actions';
import {
  IMaintenanceRequestBalanceWithRelations,
  IMaintenanceRequestShowWithRelations,
  IItemMaintenanceRequestBalance
} from '@/app/(main)/maintenance/request/maintenance-request-types';
import { MaintenanceRequestHeader } from './_components/maintenance-request-header';
import { MaintenanceRequestGeneralInfo } from './_components/maintenance-request-general-info';
import { MaintenanceRequestDemandInfo } from './_components/maintenance-request-demand-info';
import { MaintenanceRequestStatusHistory } from './_components/maintenance-request-status-history';
import { MaintenanceRequestServiceFlow } from './_components/maintenance-request-service-flow';
import { MaintenanceRequestMaterialMovement } from './_components/maintenance-request-material-movement';
import { MaintenanceRequestTimeline } from './_components/maintenance-request-timeline';
import { MaintenanceRequestStats } from './_components/maintenance-request-stats';
import { MaterialBalanceSummaryTable } from '../../../../material/(warehouse)/withdrawal/_components/material-balance-summary-table';
import { MaintenanceRequestMaterialBalance } from './_components/maintenance-request-material-balance';
import { MaintenanceRequestMaterialTabs } from './_components/maitenance-request-tabs-material';
import { showSipacRequisicaoManutencaoByNumeroAno } from '../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';
import { ISipacRequisicaoManutencaoShow } from '../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-types';
import { ManutencaoRequisicaoDemandInfo } from '../../../../sipac/requisicoes-manutencoes/_components/show/manutencao-requisicao-demand-info';
import { ManutencaoRequisicaoHistoricoStatus } from '../../../../sipac/requisicoes-manutencoes/_components/show/manutencao-requisicao-historico-status';
import { ManutencaoRequisicaoFluxoServico } from '../../../../sipac/requisicoes-manutencoes/_components/show/manutencao-requisicao-fluxo-servico';
import { ManutencaoRequisicaoAnexos } from '../../../../sipac/requisicoes-manutencoes/_components/show/manutencao-requisicao-anexos';
import { ManutencaoRequisicaoEstatisticas } from '../../../../sipac/requisicoes-manutencoes/_components/show/manutencao-requisicao-estatisticas';

interface MaintenanceRequestShowPageProps {
  params: {
    id: string;
  };
}

export default async function MaintenanceRequestShowPage({
  params
}: MaintenanceRequestShowPageProps) {
  const id = Number(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const maintenanceRequestDataBalance: IMaintenanceRequestBalanceWithRelations | null =
    await showMaintenanceRequestBalanceById(id);

  const maintenanceRequestDataBase: IMaintenanceRequestShowWithRelations | null =
    await showMaintenanceRequest(id);

  if (!maintenanceRequestDataBase) {
    // Check if base data is null first
    notFound();
  }

  // Merge the two data sources
  const maintenanceRequestData: IMaintenanceRequestShowWithRelations & {
    itemsBalance?: IItemMaintenanceRequestBalance[];
  } = {
    ...(maintenanceRequestDataBase as IMaintenanceRequestShowWithRelations), // Explicitly cast after null check
    // Add itemsBalance from balance data if it exists
    itemsBalance: maintenanceRequestDataBalance?.itemsBalance || []
  };

  const { origin } = maintenanceRequestDataBase;

  const requisicaoManutencaoData: ISipacRequisicaoManutencaoShow | null =
    origin !== 'SIPAC'
      ? null
      : await showSipacRequisicaoManutencaoByNumeroAno(
          maintenanceRequestData.protocolNumber
        );

  // Aqui eu utilizei uma mescla para unir informações da base do SIPAC e informações da base do SISMAN em função da origem da requisição. É uma implementação provisória.

  return (
    <div className='container mx-auto space-y-6 pb-6'>
      <MaintenanceRequestHeader />
      <MaintenanceRequestGeneralInfo data={maintenanceRequestData} />
      {requisicaoManutencaoData ? (
        <ManutencaoRequisicaoDemandInfo data={requisicaoManutencaoData} />
      ) : (
        <MaintenanceRequestDemandInfo data={maintenanceRequestData} />
      )}
      {requisicaoManutencaoData && (
        <ManutencaoRequisicaoAnexos data={requisicaoManutencaoData} />
      )}
      {requisicaoManutencaoData ? (
        <ManutencaoRequisicaoFluxoServico data={requisicaoManutencaoData} />
      ) : (
        <MaintenanceRequestServiceFlow data={maintenanceRequestData} />
      )}
      <MaintenanceRequestMaterialBalance data={maintenanceRequestDataBalance} />

      {/* <MaintenanceRequestMaterialMovement data={maintenanceRequestData} /> */}
      <MaintenanceRequestMaterialTabs data={maintenanceRequestData} />
      {requisicaoManutencaoData ? (
        <ManutencaoRequisicaoHistoricoStatus data={requisicaoManutencaoData} />
      ) : (
        <MaintenanceRequestStatusHistory data={maintenanceRequestData} />
      )}
      <MaintenanceRequestTimeline data={maintenanceRequestData} />
      {requisicaoManutencaoData ? (
        <ManutencaoRequisicaoEstatisticas data={requisicaoManutencaoData} />
      ) : (
        <MaintenanceRequestStats data={maintenanceRequestData} />
      )}
    </div>
  );
}
