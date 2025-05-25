// This file is the main seed file, responsible for calling other seed files to populate the database.
import { PrismaClient } from '@sisman/prisma'; // Correct path for generated client

// Import the exported 'main' functions from the specific seed files
import { main as seedUsers } from './seeds/users.seed';
import { main as seedMaterials } from './seeds/materials.seed';
import { main as seedRoles } from './seeds/roles.seed';
import { main as seedUsersRoles } from './seeds/_role-to-user.seed';

const logger = console;

// Create ONE Prisma client instance for the entire seeding process
const prisma = new PrismaClient();

// Main function to seed the database
async function mainSeed() {
  // Renamed to avoid conflict with imported 'main'
  logger.log('Starting database seeding...');
  try {
    // Call the seed functions for each entity, passing the prisma instance
    await seedUsers(prisma);
    await seedMaterials(prisma);
    await seedRoles(prisma);
    await seedUsersRoles(prisma);

    logger.log('Database seeding completed successfully.');
    // No need for process.exit(0) here, natural exit is success
  } catch (error) {
    // Log the error if something goes wrong during seeding
    logger.error('An error occurred during database seeding:', error);
    process.exit(1); // Exit with error code if any seed function fails
  } finally {
    // Always disconnect the Prisma client, whether success or error
    logger.log('Disconnecting Prisma client...');
    await prisma
      .$disconnect()
      .then(() => logger.log('Prisma client disconnected.'))
      .catch(async (disconnectError) => {
        logger.error('Error disconnecting Prisma client:', disconnectError);
        process.exit(1); // Exit with error if disconnect fails too
      });
  }
}

// Run the main seed function
mainSeed();
