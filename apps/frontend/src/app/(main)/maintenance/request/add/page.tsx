import { MaintenanceRequestAdd } from '../_components/add/maintenance-request-add';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import { getUsers } from '../../../user/user-actions';
import { getMaintenanceInstances } from '../../../maintenance/instance/instance-actions';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IMaintenanceRequestRelatedData } from '../request-types';

const logger = new Logger('maintenance-request/add/page.tsx');

// Helper function to fetch data from a given API path
async function fetchData(
  path: string,
  accessToken: string,
  errorMessage: string
) {
  try {
    const data = await fetchApiSisman(path, accessToken, {
      cache: 'force-cache'
    });
    logger.info(`Fetched data from ${path}`);
    return data;
  } catch (error) {
    logger.error(errorMessage, error);
    throw error;
  }
}

export default async function AddPage({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();

  const [
    listFacilityComplexes,
    listBuildings,
    listSpaces,
    listSystems,
    listServiceTypes,
    listUsers,
    listMaintenanceInstances
  ] = await Promise.all([
    fetchData(
      '/infrastructure-facilities-complexes',
      accessTokenSisman,
      'Erro ao buscar complexos de instalação.'
    ),
    fetchData(
      '/infrastructure-building',
      accessTokenSisman,
      'Erro ao buscar edifícios.'
    ),
    fetchData('/spaces', accessTokenSisman, 'Erro ao buscar espaços.'),
    fetchData('/systems', accessTokenSisman, 'Erro ao buscar sistemas.'),
    fetchData(
      '/service-types',
      accessTokenSisman,
      'Erro ao buscar tipos de serviço.'
    ),
    getUsers(accessTokenSisman), // Already existing action
    getMaintenanceInstances(accessTokenSisman) // Already existing action
  ]);

  const relatedData: IMaintenanceRequestRelatedData = {
    listFacilityComplexes,
    listBuildings,
    listSpaces,
    listSystems,
    listServiceTypes,
    listUsers,
    listMaintenanceInstances
  };

  return (
    <MaintenanceRequestAdd relatedData={relatedData} isInDialog={isInDialog} />
  );
}
