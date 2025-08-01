// prisma/seeds/user-roles.seed.ts
import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { UpdateUserWithRelationsDto } from '@sisman/types';

const logger = console;
const userRolesJsonPath = '../data/users-roles.json'; // Assuming data is in this file

const transformAndValidateUserRole: TransformValidateFn<
  any,
  Prisma.UserUncheckedUpdateInput // Output type for the update payload
> = async (
  rawUserRole: any
): Promise<Prisma.UserUncheckedUpdateInput | null> => {
  // --- 1. Pre-process Raw Data ---
  const processedRawUserRole = removeNullOrEmptyStringProps(rawUserRole);

  // --- 2. DTO Validation ---
  // Use the pre-processed data for DTO instantiation
  // Ensure numbers are transformed correctly if coming from JSON as strings
  const userWithRolesDto = plainToInstance(
    UpdateUserWithRelationsDto,
    processedRawUserRole,
    {
      enableImplicitConversion: true // Helps convert string numbers from JSON if needed
    }
  );

  const errors = await validate(userWithRolesDto);
  if (errors.length > 0) {
    logger.warn(
      `Skipping user role due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawUserRole)}`
    );
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }

  // Ensure the user DTO has an ID, as it's crucial for updating the correct user.
  if (!userWithRolesDto.id) {
    logger.warn(
      `Skipping user update due to missing user ID in DTO. Original Data: ${JSON.stringify(rawUserRole)}`
    );
    return null;
  }
  // --- End DTO Validation ---

  // --- 3. Data Transformation & Prisma Input Construction ---
  // Construct the Prisma Update Input object using the validated DTO data.
  // The 'id' from userWithRolesDto is part of UserUncheckedUpdateInput and
  // will be used by seedModel (likely for an upsert's update payload or if seedModel handles it).
  const updateInputPayload: Prisma.UserUncheckedUpdateInput = {
    id: userWithRolesDto.id // User's ID
  };

  // Handle the 'roles' relation if present in the DTO
  if (userWithRolesDto.roles) {
    updateInputPayload.roles = {
      set: userWithRolesDto.roles
        .filter((roleDto) => roleDto.id !== undefined && roleDto.id !== null) // Ensure role.id is valid
        .map((roleDto) => ({ id: roleDto.id! })) // Transform to { id: roleId }
    };
  }

  return updateInputPayload; // Return the data ready for Prisma update/upsert
};

/**
 * Seeds user role data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'User', // Target the User model
    jsonFilePath: userRolesJsonPath,
    prismaDelegate: prisma.user, // Use the prisma.user delegate
    transformAndValidate: transformAndValidateUserRole,
    // Assuming 'id' is the unique key in your user JSON data and User model
    // used by seedModel to identify records for update/upsert.
    uniqueKey: 'id',
    method: 'update'
  });
}
