import { NextResponse } from 'next/server';
import { getSetupState, isSetupComplete, hasAdminUser } from '@/lib/setup';

export async function GET() {
  try {
    const state = await getSetupState();
    const isComplete = await isSetupComplete();
    const hasAdmin = await hasAdminUser();

    return NextResponse.json({
      ...state,
      isComplete,
      hasAdmin,
    });
  } catch {
    // Database might not be accessible yet
    return NextResponse.json({
      currentStep: 'database',
      isComplete: false,
      completedSteps: [],
      hasAdmin: false,
      error: 'Database connection failed',
    });
  }
}
