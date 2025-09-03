// This file is the main seed file, responsible for calling other seed files to populate the database.
import { PrismaClient } from '@sisman/prisma'; // Correct path for generated client

// Import the exported 'main' functions from the specific seed files
import { main as seedUsers } from './seeds/users.seed';
import { main as seedRoles } from './seeds/roles.seed';
import { main as seedUsersRoles } from './seeds/_role-to-user.seed';
import { main as seedSipacImoveis } from './seeds/sipac-imoveis.seed';
import { main as seedSipacPredios } from './seeds/sipac-predios.seed';
import { main as seedWorkersSpecialties } from './seeds/workers-specialties.seed';
import { main as seedInfrastructureFacilityComplex } from './seeds/infrasctructure-facility-complex.seed';
import { main as seedInfrastructureSpaceTypes } from './seeds/infrastructure-space-types.seed';
import { main as seedInfrastructureBuildings } from './seeds/infrastructure-buildings.seed';
import { main as seedMaterialStockMovementTypes } from './seeds/material-stock-movement-types.seed';

//

const logger = console;

// Create ONE Prisma client instance for the entire seeding process
const prisma = new PrismaClient();

// Map seed names to their respective functions
const seedFunctions: {
  [key: string]: (prisma: PrismaClient) => Promise<void>;
} = {
  seedUsers,
  seedRoles,
  seedUsersRoles,
  seedSipacImoveis,
  seedSipacPredios,
  seedWorkersSpecialties,
  seedInfrastructureFacilityComplex,
  seedInfrastructureSpaceTypes,
  seedInfrastructureBuildings,
  seedMaterialStockMovementTypes
};

// Main function to seed the database
async function mainSeed() {
  const args = process.argv.slice(2); // Get command line arguments, excluding 'node' and script path

  logger.log('Starting database seeding...');
  try {
    if (args.length > 0) {
      const seedName = args[0]; // Get the first argument as the seed name
      const seedFunction = seedFunctions[seedName];
      if (seedFunction) {
        logger.log(`Running specific seed: ${seedName}`);
        await seedFunction(prisma);
      } else {
        logger.error(`Seed function "${seedName}" not found.`);
        process.exit(1);
      }
    } else {
      logger.log('Running all seed functions...');
      // Call the seed functions for each entity, passing the prisma instance
      await seedUsers(prisma);
      await seedRoles(prisma);
      await seedUsersRoles(prisma);
      await seedSipacImoveis(prisma);
      await seedSipacPredios(prisma);
      await seedWorkersSpecialties(prisma);
      await seedInfrastructureFacilityComplex(prisma);
      await seedInfrastructureSpaceTypes(prisma);
      await seedInfrastructureBuildings(prisma);
      await seedMaterialStockMovementTypes(prisma);
    }

    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('An error occurred during database seeding:', error);
    process.exit(1);
  } finally {
    logger.log('Disconnecting Prisma client...');
    await prisma
      .$disconnect()
      .then(() => logger.log('Prisma client disconnected.'))
      .catch(async (disconnectError) => {
        logger.error('Error disconnecting Prisma client:', disconnectError);
        process.exit(1);
      });
  }
}

// Run the main seed function
mainSeed();
