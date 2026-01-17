import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appSettings, users } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured' },
      { status: 400 }
    );
  }

  try {
    // Clear setup-related tables to allow fresh setup
    await db.execute(sql`DELETE FROM setup_status`);
    await db.delete(appSettings);
    await db.delete(users);

    // Reset sequences
    try {
      await db.execute(sql`SELECT setval('app_settings_id_seq', 1, false)`);
      await db.execute(sql`SELECT setval('setup_status_id_seq', 1, false)`);
    } catch {
      // Sequences might not exist yet
    }

    // Clear the setup cookie
    const response = NextResponse.json({
      success: true,
      message: 'Setup reset successfully. Refresh the page to restart setup.',
    });

    response.cookies.delete('setup_complete');

    return response;
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Reset failed' },
      { status: 500 }
    );
  }
}
