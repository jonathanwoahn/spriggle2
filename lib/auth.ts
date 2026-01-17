import { auth } from '@/auth';

/**
 * Get the current session
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * Check if there is a logged-in user
 */
export async function isUser(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get the current user or throw if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Get the current user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}
