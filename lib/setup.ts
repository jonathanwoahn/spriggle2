import { db } from '@/db';
import { setupStatus, users, appSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type SetupStep = 'database' | 'admin' | 'api_keys' | 'complete';

export interface SetupState {
  currentStep: SetupStep;
  isComplete: boolean;
  completedSteps: SetupStep[];
}

const SETUP_STEPS: SetupStep[] = ['database', 'admin', 'api_keys', 'complete'];

export async function getSetupState(): Promise<SetupState> {
  try {
    const steps = await db.select().from(setupStatus);
    const completedSteps = steps
      .filter(s => s.completed)
      .map(s => s.step as SetupStep);

    const isComplete = completedSteps.includes('complete');

    // Find first incomplete step
    let currentStep: SetupStep = 'database';
    for (const step of SETUP_STEPS) {
      if (!completedSteps.includes(step)) {
        currentStep = step;
        break;
      }
    }

    return {
      currentStep,
      isComplete,
      completedSteps,
    };
  } catch {
    // If we can't query the database, we're at the database step
    return {
      currentStep: 'database',
      isComplete: false,
      completedSteps: [],
    };
  }
}

export async function markStepComplete(step: SetupStep): Promise<void> {
  const existing = await db.select().from(setupStatus).where(eq(setupStatus.step, step));

  if (existing.length > 0) {
    await db.update(setupStatus)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(setupStatus.step, step));
  } else {
    await db.insert(setupStatus).values({
      step,
      completed: true,
      completedAt: new Date(),
    });
  }
}

export async function isSetupComplete(): Promise<boolean> {
  try {
    const completeStep = await db.select()
      .from(setupStatus)
      .where(eq(setupStatus.step, 'complete'));

    return completeStep.length > 0 && completeStep[0].completed === true;
  } catch {
    return false;
  }
}

export async function hasAdminUser(): Promise<boolean> {
  try {
    const admins = await db.select()
      .from(users)
      .where(eq(users.role, 'admin'));

    return admins.length > 0;
  } catch {
    return false;
  }
}

export async function hasRequiredApiKeys(): Promise<boolean> {
  try {
    const requiredKeys = ['cashmereApiKey', 'elevenLabsApiKey'];
    const settings = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, requiredKeys[0]));

    // Check if we have at least cashmere key set
    return settings.length > 0 && !!settings[0].value;
  } catch {
    return false;
  }
}

export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    // Simple query to test connection
    await db.select().from(setupStatus).limit(1);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

export async function initializeSetupTable(): Promise<void> {
  // Create initial setup steps if they don't exist
  for (const step of SETUP_STEPS) {
    const existing = await db.select().from(setupStatus).where(eq(setupStatus.step, step));
    if (existing.length === 0) {
      await db.insert(setupStatus).values({
        step,
        completed: false,
      });
    }
  }
}
