import { writeFileSync } from 'fs';
import path from 'path';

// Define the infrastructure entities and their models
const entities = [
  {
    name: 'occurrence',
    model: 'InfrastructureOccurrence',
    idType: 'number',
    include: {
      facilityComplex: true,
      building: true,
      space: true,
      reportedBy: true,
      reinforcements: true,
      diagnosis: true
    }
  },
  {
    name: 'occurrence-diagnosis',
    model: 'InfrastructureOccurrenceDiagnosis',
    idType: 'number',
    include: {
      occurrence: true,
      analyzedBy: true,
      maintenanceRequest: true,
      associatedRisks: true
    }
  },
  {
    name: 'occurrence-reinforcement',
    model: 'InfrastructureOccurrenceReinforcement',
    idType: 'number',
    include: {
      occurrence: true,
      user: true
    }
  },
  {
    name: 'space',
    model: 'InfrastructureSpace',
    idType: 'number',
    include: {
      spaceType: true,
      building: true,
      parent: true,
      children: true,
      InfrastructureSpaceUser: true
    }
  },
  {
    name: 'space-type',
    model: 'InfrastructureSpaceType',
    idType: 'number',
    include: {
      spaces: true
    }
  },
  {
    name: 'system',
    model: 'InfrastructureSystem',
    idType: 'number',
    include: {
      buildings: true
    }
  }
];

// Generate types and actions files for each entity
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

const PAGE_PATH = '/infrastructure/${name}';
const API_RELATIVE_PATH = '/infrastructure/${name}';

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
  const typesPath = path.join('apps/frontend/src/app/(main)/infrastructure', name, `${name}-types.ts`);
  const actionsPath = path.join('apps/frontend/src/app/(main)/infrastructure', name, `${name}-actions.ts`);
  
  writeFileSync(typesPath, typesContent);
  writeFileSync(actionsPath, actionsContent);
  
  console.log(`Generated files for ${name}`);
});

console.log('All infrastructure files generated successfully!');
