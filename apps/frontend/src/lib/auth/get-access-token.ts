// /home/node/sisman-monorepo/apps/frontend/src/lib/auth/get-sisman-access-token.ts
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options'; // Adjust path if necessary
import Logger from '@/lib/logger';

const logger = new Logger('GetAccessToken');

// Get access-token in server side
// Define a more specific interface for your session.
// This should match the structure defined in your NextAuth `jwt` and `session` callbacks.
interface UserSession extends Session {
  accessTokenSisman?: string; // Token for SISMAN API
  accessTokenUfrn?: string; // Token for UFRN API
  // Example alternative structure:
  // user?: {
  //   accessTokenSisman?: string;
  //   [key: string]: any;
  // } & Session['user'];
}

/**
 * Retrieves the SISMAN access token from the authenticated user's session.
 *
 * This function is designed to be called from server-side contexts (Server Components,
 * Route Handlers, etc.) where `getServerSession` can be invoked.
 *
 * @returns A Promise that resolves with the SISMAN access token (string).
 * @throws Throws an error if the user is not authenticated or if the
 *         `accessTokenSisman` is not found in the session.
 */
export async function getSismanAccessToken(): Promise<string> {
  const session = (await getServerSession(authOptions)) as UserSession | null;

  if (!session) {
    logger.error('No active user session found.');
    throw new Error(
      'User not authenticated. Unable to retrieve SISMAN access token.'
    );
  }

  if (!session.accessTokenSisman) {
    logger.error(
      'SISMAN access token (accessTokenSisman) not found in the user session.'
    );
    throw new Error('SISMAN access token not found in session.');
  }

  return session.accessTokenSisman;
}

/**
 * Retrieves the UFRN access token from the authenticated user's session.
 *
 * This function is designed to be called from server-side contexts (Server Components,
 * Route Handlers, etc.) where `getServerSession` can be invoked.
 *
 * @returns A Promise that resolves with the UFRN access token (string).
 * @throws Throws an error if the user is not authenticated or if the
 *         `accessTokenUfrn` is not found in the session.
 */
export async function getUfrnAccessToken(): Promise<string> {
  const session = (await getServerSession(authOptions)) as UserSession | null;

  if (!session) {
    logger.error('No active user session found.');
    throw new Error(
      'User not authenticated. Unable to retrieve UFRN access token.'
    );
  }

  if (!session.accessTokenUfrn) {
    logger.error(
      'UFRN access token (accessTokenUfrn) not found in the user session.'
    );
    throw new Error('UFRN access token not found in session.');
  }

  return session.accessTokenUfrn;
}
