import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const execAsync = promisify(exec);

export async function POST() {
  // Only allow in development or if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured' },
      { status: 400 }
    );
  }

  try {
    // Run drizzle-kit push to create/update schema
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    console.log('Schema push output:', stdout);
    if (stderr) {
      console.log('Schema push stderr:', stderr);
    }

    // Reset serial sequences to avoid duplicate key errors
    try {
      await db.execute(sql`SELECT setval('app_settings_id_seq', COALESCE((SELECT MAX(id) FROM app_settings), 0) + 1, false)`);
      await db.execute(sql`SELECT setval('block_metadata_id_seq', COALESCE((SELECT MAX(id) FROM block_metadata), 0) + 1, false)`);
      await db.execute(sql`SELECT setval('collections_id_seq', COALESCE((SELECT MAX(id) FROM collections), 0) + 1, false)`);
      await db.execute(sql`SELECT setval('collection_books_id_seq', COALESCE((SELECT MAX(id) FROM collection_books), 0) + 1, false)`);
      console.log('Serial sequences reset successfully');
    } catch (seqError) {
      console.log('Could not reset sequences (non-fatal):', seqError);
    }

    return NextResponse.json({
      success: true,
      message: 'Schema pushed successfully',
      output: stdout,
    });
  } catch (error) {
    console.error('Schema push error:', error);
    return NextResponse.json(
      {
        error: 'Failed to push schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
