import { Suspense } from 'react';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import Logger from '../../../../lib/logger';
import Loading from '../../../../components/loading';
import {
  getRefreshedSipacRequisicoesManutencao,
  getSipacRequisicoesManutencao
} from './requisicoes-manutencoes-actions';
import { RequisicoesManutencoesListPage } from './_components/list/requisicoes-manutencoes-list';

const logger = new Logger('requisicoes-manutencoes-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const [initialRequisicoesManutencao] = await Promise.all([
    getSipacRequisicoesManutencao(accessTokenSisman)
  ]);

  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <RequisicoesManutencoesListPage
      initialRequisicoesManutencao={initialRequisicoesManutencao}
      refreshAction={getRefreshedSipacRequisicoesManutencao}
      key={listKey}
    />
  );
}
