// prisma/seeds/users.seed.ts
import type { PrismaClient, Prisma } from '@sisman/prisma';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  removeNullOrEmptyStringProps,
  seedModel,
  TransformValidateFn
} from './seed-utils';
import { CreateUserDto } from '../../../modules/users/dto/user.dto';

const logger = console;
const usersJsonPath = '../data/users.json';

const transformAndValidateUser: TransformValidateFn<
  any,
  Prisma.UserCreateInput
> = async (rawUser): Promise<Prisma.UserCreateInput | null> => {
  // --- 1. Pre-process Raw Data using the generic function ---

  const processedRawUser = removeNullOrEmptyStringProps(rawUser);
  // O log agora é feito dentro da função genérica, mas você pode adicionar um aqui se quiser ver o resultado final
  // logger.debug(`Raw user after cleaning null/empty: ${JSON.stringify(processedRawUser)}`);

  // --- 2. DTO Validation ---
  // Use the pre-processed data for DTO instantiation
  const userDto = plainToInstance(CreateUserDto, processedRawUser, {
    // excludeExtraneousValues: true, // Optional: helps ensure no extra props sneak in
  });

  const errors = await validate(userDto);
  if (errors.length > 0) {
    // Log the original raw data for easier debugging
    logger.warn(
      `Skipping user due to validation errors: ${errors.map((e) => Object.values(e.constraints || {})).join(', ')}. Original Data: ${JSON.stringify(rawUser)}`
    );
    // Log the detailed errors
    logger.warn('Validation Errors:', JSON.stringify(errors));
    return null;
  }
  // --- End DTO Validation ---

  // --- 3. Data Transformation & Prisma Input Construction ---

  // **SECURITY**: Hash the password before seeding
  // let hashedPassword;
  // try {
  //   // Check if password might already be hashed (simple check, adjust if needed)
  //   if (userDto.password.startsWith('$2b$')) {
  //     hashedPassword = userDto.password;
  //     logger.debug(
  //       `Password for ${userDto.email} seems already hashed. Using as is.`,
  //     );
  //   } else {
  //     const saltRounds = 10; // Standard salt rounds
  //     hashedPassword = await bcrypt.hash(userDto.password, saltRounds);
  //     logger.debug(`Hashed password for ${userDto.email}.`);
  //   }
  // } catch (hashError) {
  //   logger.error(`Failed to hash password for ${userDto.email}:`, hashError);
  //   return null; // Skip user if hashing fails
  // }

  // Construct the Prisma Create Input object using the validated DTO data
  const createInput: Prisma.UserUncheckedCreateInput = {
    id: userDto.id,
    name: userDto.name,
    email: userDto.email,
    login: userDto.login
    // password: hashedPassword, // Use the hashed password
    // // Only include birthAt if it exists and is valid in the DTO
    // ...(userDto.birthAt && { birthAt: userDto.birthAt }),
    // // Only include role if it exists in the DTO (it should be the correct enum type now)
    // ...(userDto.role !== undefined && { role: userDto.role }),
  };

  return createInput; // Return the data ready for Prisma
};

/**
 * Seeds user data using the generic utility.
 * @param prisma - The Prisma client instance.
 */
export async function main(prisma: PrismaClient): Promise<void> {
  await seedModel({
    prisma,
    modelName: 'User',
    jsonFilePath: usersJsonPath,
    prismaDelegate: prisma.user,
    transformAndValidate: transformAndValidateUser,
    uniqueKey: 'email'
  });
}
