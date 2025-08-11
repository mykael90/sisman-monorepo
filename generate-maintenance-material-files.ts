import { writeFileSync } from 'fs';
import path from 'path';

// Define maintenance entities and their models
const maintenanceEntities = [
  {
    name: 'instance',
    model: 'MaintenanceInstance',
    idType: 'number',
    include: {
      currentMaintenanceRequests: true,
      timelineEventsTransferredFrom: true,
      timelineEventsTransferredTo: true,
      warehouses: true,
      InfrastructureBuilding: true,
      InfrastructureFacilityComplex: true,
      users: true
    }
  },
  {
    name: 'request',
    model: 'MaintenanceRequest',
    idType: 'number',
    include: {
      priorities: true,
      facilityComplex: true,
      building: true,
      space: true,
      system: true,
      currentMaintenanceInstance: true,
      createdBy: true,
      assignedTo: true,
      serviceType: true,
      statuses: true,
      diagnosis: true,
      timelineEvents: true,
      materialRequests: true,
      materialStockMovements: true,
      materialWithdrawals: true,
      materialPickingOrders: true,
      serviceOrders: true,
      sipacUnitRequesting: true,
      sipacUnitCost: true
    }
  },
  {
    name: 'request-status',
    model: 'MaintenanceRequestStatus',
    idType: 'number',
    include: {
      maintenanceRequest: true
    }
  },
  {
    name: 'service-type',
    model: 'MaintenanceServiceType',
    idType: 'number',
    include: {
      maintenanceRequests: true
    }
  },
  {
    name: 'timeline-event',
    model: 'MaintenanceTimelineEvent',
    idType: 'number',
    include: {
      maintenanceRequest: true,
      actionBy: true,
      transferredFromInstance: true,
      transferredToInstance: true
    }
  }
];

// Define material entities and their models
const materialEntities = [
  {
    name: 'picking-order',
    model: 'MaterialPickingOrder',
    idType: 'number',
    include: {
      maintenanceRequest: true
    }
  },
  {
    name: 'receipt',
    model: 'MaterialReceipt',
    idType: 'number',
    include: {
      // Add actual relations once material.prisma is available
    }
  },
  {
    name: 'request',
    model: 'MaterialRequest',
    idType: 'number',
    include: {
      maintenanceRequest: true
    }
  },
  {
    name: 'restriction-order',
    model: 'MaterialRestrictionOrder',
    idType: 'number',
    include: {
      // Add actual relations once material.prisma is available
    }
  },
  {
    name: 'stock-movement',
    model: 'MaterialStockMovement',
    idType: 'number',
    include: {
      maintenanceRequest: true,
      stockMovementType: true
    }
  },
  {
    name: 'stock-movement-type',
    model: 'MaterialStockMovementType',
    idType: 'number',
    include: {
      materialStockMovements: true
    }
  },
  {
    name: 'warehouse-stock',
    model: 'MaterialWarehouseStock',
    idType: 'number',
    include: {
      // Add actual relations once material.prisma is available
    }
  },
  {
    name: 'withdrawal',
    model: 'MaterialWithdrawal',
    idType: 'number',
    include: {
      maintenanceRequest: true
    }
  }
];

// Generate types and actions files for each entity
function generateFiles(entities: any[], basePath: string) {
  entities.forEach(entity => {
    const { name, model, idType, include } = entity;
    const pascalName = name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    
    // Create types file
    const typesContent = `import { ${model}, Prisma } from '@sisman/prisma';

export type I${pascalName}WithRelations = Prisma.${model}GetPayload<{
  include: ${JSON.stringify(include).replace(/"/g, '')}
}>;

export interface I${pascalName}Add extends Omit<Prisma.${model}CreateInput, 
  ${Object.keys(include).map(key => `'${key}'`).join(' | ')}
> {}

export interface I${pascalName}Edit extends I${pascalName}Add {
  id: ${idType};
}

export type I${pascalName} = ${model};

export type I${pascalName}Remove = {
  id: ${idType};
};

export type I${pascalName}Select = Prisma.${model}Select;

export type I${pascalName}RelatedData = {
  // Will be added later
};
`;
    
    // Create actions file
    const actionsContent = `'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { I${pascalName}Add, I${pascalName}Edit } from './${name}-types';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/${basePath}/${name}';
const API_RELATIVE_PATH = '/${basePath}/${name}';

const logger = new Logger(\`\${PAGE_PATH}/${name}-actions\`);

export async function get${pascalName}s(accessTokenSisman: string) {
  logger.info(\`(Server Action) get${pascalName}s: Fetching ${name}s\`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(\`(Server Action) get${pascalName}s: \${data.length} ${name}s returned\`);
    return data;
  } catch (error) {
    logger.error(\`(Server Action) get${pascalName}s: Error fetching ${name}s\`, error);
    throw error;
  }
}

export async function show${pascalName}(accessTokenSisman: string, id: ${idType}) {
  logger.info(\`(Server Action) show${pascalName}: Fetching ${name} \${id}\`);
  try {
    const data = await fetchApiSisman(
      \`\${API_RELATIVE_PATH}/\${id}\`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(\`(Server Action) show${pascalName}: ${name} \${id} returned\`);
    return data;
  } catch (error) {
    logger.error(\`(Server Action) show${pascalName}: Error fetching ${name} \${id}\`, error);
    throw error;
  }
}

export async function getRefreshed${pascalName}s() {
  logger.info(\`(Server Action) getRefreshed${pascalName}s: Revalidating \${PAGE_PATH}\`);
  try {
    revalidatePath(PAGE_PATH);
    logger.info(\`(Server Action) getRefreshed${pascalName}s: Path \${PAGE_PATH} revalidated\`);
    return true;
  } catch (error) {
    logger.error(\`(Server Action) getRefreshed${pascalName}s: Error revalidating path\`, error);
  }
}

export async function add${pascalName}(
  prevState: unknown,
  data: I${pascalName}Add
): Promise<IActionResultForm<I${pascalName}Add, any>> {
  logger.info(\`(Server Action) add${pascalName}: Attempt to add ${name}\`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<I${pascalName}Add, any, I${pascalName}Add>(
      data,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      '${pascalName} added successfully!'
    );
  } catch (error) {
    logger.error(\`(Server Action) add${pascalName}: Unexpected error\`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function update${pascalName}(
  prevState: unknown,
  data: I${pascalName}Edit
): Promise<IActionResultForm<I${pascalName}Edit, any>> {
  logger.info(\`(Server Action) update${pascalName}: Attempt to update ${name} \${data.id}\`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<I${pascalName}Edit, any, I${pascalName}Edit>(
      data,
      data,
      {
        endpoint: \`\${API_RELATIVE_PATH}/\${data.id}\`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: \`\${PAGE_PATH}/edit/\${data.id}\`
      },
      '${pascalName} updated successfully!'
    );
  } catch (error) {
    logger.error(\`(Server Action) update${pascalName}: Error updating ${name} \${data.id}\`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
`;
    
    // Write files
    const typesPath = path.join('apps/frontend/src/app/(main)', basePath, name, `${name}-types.ts`);
    const actionsPath = path.join('apps/frontend/src/app/(main)', basePath, name, `${name}-actions.ts`);
    
    writeFileSync(typesPath, typesContent);
    writeFileSync(actionsPath, actionsContent);
    
    console.log(`Generated files for ${basePath}/${name}`);
  });
}

// Generate maintenance files
generateFiles(maintenanceEntities, 'maintenance');

// Generate material files
generateFiles(materialEntities, 'material');

console.log('All maintenance and material files generated successfully!');
